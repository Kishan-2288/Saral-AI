from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.appointment_slot import AppointmentSlot
from app.models.booking_link import BookingLink
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.schemas.booking import (
    BookingPatientRead,
    ManualBookingLinkCreate,
    N8NBookingRequest,
)

router = APIRouter()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _check_n8n_secret(secret: str | None) -> None:
    expected = settings.N8N_WEBHOOK_SECRET
    if expected and secret != expected:
        raise HTTPException(status_code=401, detail="Invalid n8n webhook secret")


def _get_active_link(db: Session, token: str) -> BookingLink:
    link = db.query(BookingLink).filter(BookingLink.token == token).first()
    if not link:
        raise HTTPException(404, "Booking link not found")

    if link.expires_at and link.expires_at <= utc_now() and link.status not in {"confirmed", "paid"}:
        if link.is_active:
            link.is_active = False
            link.status = "expired"
            db.commit()
        raise HTTPException(410, "Booking link has expired")

    if not link.is_active and link.status != "confirmed":
        raise HTTPException(410, f"Booking link is {link.status}")

    if link.status in {"expired", "cancelled"}:
        raise HTTPException(410, f"Booking link is {link.status}")

    return link


def _validate_n8n_booking(payload: N8NBookingRequest, db: Session):
    hospital = db.get(Hospital, payload.hospital_id)
    if not hospital or hospital.status != "active":
        raise HTTPException(404, "Hospital not found or inactive")

    department = db.get(Department, payload.department_id)
    if not department or department.hospital_id != hospital.id or department.status != "active":
        raise HTTPException(400, "Invalid department for this hospital")

    doctor = db.get(Doctor, payload.doctor_id)
    if (
        not doctor
        or doctor.hospital_id != hospital.id
        or doctor.department_id != department.id
        or doctor.status != "active"
    ):
        raise HTTPException(400, "Invalid doctor for this hospital and department")

    slot = db.get(AppointmentSlot, payload.slot_id)
    if not slot or slot.doctor_id != doctor.id:
        raise HTTPException(400, "Invalid appointment slot")
    if not slot.available:
        raise HTTPException(409, "Selected appointment slot is no longer available")
    if slot.slot_date != payload.appointment_date or slot.start_time != payload.appointment_time:
        raise HTTPException(400, "Appointment date/time does not match the selected slot")

    return hospital, department, doctor, slot


def _link_response(link: BookingLink, hospital: Hospital, department: Department | None, doctor: Doctor | None, slot: AppointmentSlot | None):
    return {
        "booking_token": link.token,
        "booking_link_id": link.id,
        "url": f"{settings.BOOKING_FRONTEND_URL.rstrip('/')}/book/{link.token}",
        "expires_at": link.expires_at,
        "amount": link.amount,
        "currency": link.currency,
        "status": link.status,
        "hospital": {"id": str(hospital.id), "name": hospital.name},
        "department": None if not department else {"id": str(department.id), "name": department.name},
        "doctor": None if not doctor else {"id": str(doctor.id), "name": doctor.name, "specialization": doctor.specialization, "consultation_fee": doctor.consultation_fee},
        "slot": None if not slot else {"id": str(slot.id), "date": slot.slot_date.isoformat(), "time": slot.start_time.strftime("%H:%M"), "end_time": slot.end_time.strftime("%H:%M")},
        "patient": {"id": str(link.patient_id) if link.patient_id else None, "name": link.patient_name, "phone": link.patient_phone, "email": link.patient_email, "reason_for_visit": link.reason_for_visit},
    }


@router.post("/n8n")
def create_booking_link_from_n8n(
    payload: N8NBookingRequest,
    x_n8n_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    _check_n8n_secret(x_n8n_secret)
    hospital, department, doctor, slot = _validate_n8n_booking(payload, db)
    now = utc_now()

    existing = db.query(BookingLink).filter(
        BookingLink.hospital_id == hospital.id,
        BookingLink.doctor_id == doctor.id,
        BookingLink.slot_id == slot.id,
        BookingLink.patient_phone == payload.phone,
        BookingLink.status.in_(["pending", "payment_pending"]),
        BookingLink.is_active.is_(True),
        BookingLink.expires_at > now,
    ).order_by(BookingLink.created_at.desc()).first()

    if existing:
        link = existing
        link.patient_name = payload.name
        link.patient_email = payload.email
        link.reason_for_visit = payload.reason_for_visit
        link.department_id = department.id
        link.amount = doctor.consultation_fee
        link.appointment_date = slot.slot_date
        link.appointment_time = slot.start_time
    else:
        link = BookingLink(
            hospital_id=hospital.id, doctor_id=doctor.id, department_id=department.id, slot_id=slot.id,
            source=payload.source, patient_name=payload.name, patient_phone=payload.phone,
            patient_email=payload.email, reason_for_visit=payload.reason_for_visit,
            appointment_date=slot.slot_date, appointment_time=slot.start_time,
            amount=doctor.consultation_fee, currency="INR", status="pending", is_active=True,
            expires_at=now + timedelta(minutes=settings.BOOKING_LINK_EXPIRE_MINUTES),
        )
        db.add(link)

    db.commit()
    db.refresh(link)
    return _link_response(link, hospital, department, doctor, slot)


@router.post("/links")
def create_booking_link(payload: ManualBookingLinkCreate, db: Session = Depends(get_db)):
    hospital = db.get(Hospital, payload.hospital_id)
    if not hospital or hospital.status != "active":
        raise HTTPException(404, "Hospital not found or inactive")

    now = utc_now()
    link = BookingLink(
        hospital_id=hospital.id, source=payload.source, status="pending", is_active=True,
        expires_at=now + timedelta(minutes=settings.BOOKING_LINK_EXPIRE_MINUTES),
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return {
        "booking_token": link.token,
        "booking_link_id": link.id,
        "url": f"{settings.BOOKING_FRONTEND_URL.rstrip('/')}/book/{link.token}",
        "expires_at": link.expires_at,
    }


@router.get("/{booking_token}")
def get_booking(booking_token: str, db: Session = Depends(get_db)):
    link = _get_active_link(db, booking_token)
    hospital = db.get(Hospital, link.hospital_id)
    department = db.get(Department, link.department_id) if link.department_id else None
    doctor = db.get(Doctor, link.doctor_id) if link.doctor_id else None
    slot = db.get(AppointmentSlot, link.slot_id) if link.slot_id else None

    if not hospital:
        raise HTTPException(404, "Hospital not found")

    return _link_response(link, hospital, department, doctor, slot)


@router.get("/{booking_token}/slots")
def booking_slots(booking_token: str, doctor_id: str, date: str, db: Session = Depends(get_db)):
    link = _get_active_link(db, booking_token)
    doctor = db.get(Doctor, doctor_id)
    if not doctor or doctor.hospital_id != link.hospital_id or doctor.status != "active":
        raise HTTPException(400, "Doctor does not belong to this booking link's hospital")

    try:
        slot_date = date.fromisoformat(date)
    except ValueError:
        raise HTTPException(400, "Invalid date. Use YYYY-MM-DD")

    slots = db.query(AppointmentSlot).filter(
        AppointmentSlot.doctor_id == doctor.id,
        AppointmentSlot.slot_date == date_type,
        AppointmentSlot.available.is_(True),
    ).order_by(AppointmentSlot.start_time).all()

    return {
        "doctor_id": str(doctor.id),
        "date": date,
        "slots": [{"id": str(s.id), "time": s.start_time.strftime("%H:%M"), "end_time": s.end_time.strftime("%H:%M"), "available": s.available} for s in slots],
    }
