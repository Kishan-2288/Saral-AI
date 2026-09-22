from datetime import date as date_type
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.appointment_slot import AppointmentSlot
from app.models.booking_link import BookingLink
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.schemas.booking import (
    ManualBookingLinkCreate,
    N8NBookingRequest,
)

router = APIRouter()


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class CompleteBookingRequest(BaseModel):
    """
    Information submitted by the patient from the
    Saral Booking page.
    """

    department_id: UUID
    doctor_id: UUID
    slot_id: UUID

    patient_name: str = Field(
        ...,
        min_length=2,
        max_length=200,
    )

    patient_phone: str = Field(
        ...,
        min_length=7,
        max_length=50,
    )

    patient_email: EmailStr | None = None

    reason_for_visit: str | None = Field(
        default=None,
        max_length=2000,
    )


# ============================================================
# HELPERS
# ============================================================

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _check_n8n_secret(secret: str | None) -> None:
    expected = settings.N8N_WEBHOOK_SECRET

    if expected and secret != expected:
        raise HTTPException(
            status_code=401,
            detail="Invalid n8n webhook secret",
        )


def _get_active_link(
    db: Session,
    token: str,
) -> BookingLink:

    link = (
        db.query(BookingLink)
        .filter(
            BookingLink.token == token,
        )
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=404,
            detail="Booking link not found",
        )

    # --------------------------------------------------------
    # Expiration check
    # --------------------------------------------------------

    if (
        link.expires_at
        and link.expires_at <= utc_now()
        and link.status not in {"confirmed", "paid"}
    ):
        if link.is_active:
            link.is_active = False
            link.status = "expired"
            db.commit()

        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    # --------------------------------------------------------
    # Inactive link
    # --------------------------------------------------------

    if (
        not link.is_active
        and link.status not in {"confirmed", "paid"}
    ):
        raise HTTPException(
            status_code=410,
            detail=f"Booking link is {link.status}",
        )

    # --------------------------------------------------------
    # Explicitly expired/cancelled
    # --------------------------------------------------------

    if link.status in {
        "expired",
        "cancelled",
    }:
        raise HTTPException(
            status_code=410,
            detail=f"Booking link is {link.status}",
        )

    return link


def _link_response(
    link: BookingLink,
    hospital: Hospital,
    department: Department | None = None,
    doctor: Doctor | None = None,
    slot: AppointmentSlot | None = None,
):
    """
    Common response structure used by booking endpoints.
    """

    return {
        "booking_token": link.token,
        "booking_link_id": link.id,

        "url": (
            f"{settings.BOOKING_FRONTEND_URL.rstrip('/')}"
            f"/book/{link.token}"
        ),

        "expires_at": link.expires_at,

        "amount": link.amount,
        "currency": link.currency,
        "status": link.status,

        # ----------------------------------------------------
        # Hospital
        # ----------------------------------------------------

        "hospital": {
            "id": str(hospital.id),
            "name": hospital.name,
            "phone": hospital.phone,
            "email": hospital.email,
            "address": hospital.address,
        },

        # ----------------------------------------------------
        # Department
        # ----------------------------------------------------

        "department": (
            None
            if not department
            else {
                "id": str(department.id),
                "name": department.name,
                "description": department.description,
            }
        ),

        # ----------------------------------------------------
        # Doctor
        # ----------------------------------------------------

        "doctor": (
            None
            if not doctor
            else {
                "id": str(doctor.id),
                "name": doctor.name,
                "specialization": doctor.specialization,
                "consultation_fee": doctor.consultation_fee,
            }
        ),

        # ----------------------------------------------------
        # Appointment Slot
        # ----------------------------------------------------

        "slot": (
            None
            if not slot
            else {
                "id": str(slot.id),
                "date": slot.slot_date.isoformat(),
                "time": slot.start_time.strftime("%H:%M"),
                "end_time": slot.end_time.strftime("%H:%M"),
            }
        ),

        # ----------------------------------------------------
        # Patient
        # ----------------------------------------------------

        "patient": {
            "id": (
                str(link.patient_id)
                if link.patient_id
                else None
            ),

            "name": link.patient_name,
            "phone": link.patient_phone,
            "email": link.patient_email,
            "reason_for_visit": link.reason_for_visit,
        },
    }


# ============================================================
# STEP 1
# N8N CREATES A HOSPITAL-LEVEL BOOKING LINK
# ============================================================

@router.post("/n8n")
def create_booking_link_from_n8n(
    payload: N8NBookingRequest,
    x_n8n_secret: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """
    n8n sends only the hospital ID and source.

    Example:

    {
        "hospital_id": "...",
        "source": "whatsapp"
    }

    The patient will choose:

    Department
    Doctor
    Date
    Time
    Patient details

    on the Saral Booking page.
    """

    _check_n8n_secret(x_n8n_secret)

    # --------------------------------------------------------
    # Validate hospital
    # --------------------------------------------------------

    hospital = db.get(
        Hospital,
        payload.hospital_id,
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    if hospital.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Hospital is inactive",
        )

    now = utc_now()

    # --------------------------------------------------------
    # Reuse an existing active booking link
    # for this hospital and source
    # --------------------------------------------------------

    existing = (
        db.query(BookingLink)
        .filter(
            BookingLink.hospital_id == hospital.id,
            BookingLink.source == payload.source,
            BookingLink.is_active.is_(True),
            BookingLink.status == "pending",
            BookingLink.expires_at > now,
        )
        .order_by(
            BookingLink.created_at.desc()
        )
        .first()
    )

    if existing:
        link = existing

    else:
        # ----------------------------------------------------
        # Create new hospital-level booking link
        # ----------------------------------------------------

        link = BookingLink(
            hospital_id=hospital.id,
            source=payload.source,
            status="pending",
            is_active=True,
            expires_at=(
                now
                + timedelta(
                    minutes=settings.BOOKING_LINK_EXPIRE_MINUTES
                )
            ),
        )

        db.add(link)
        db.commit()
        db.refresh(link)

    return _link_response(
        link=link,
        hospital=hospital,
    )


# ============================================================
# MANUAL / ADMIN BOOKING-LINK CREATION
# ============================================================

@router.post("/links")
def create_booking_link(
    payload: ManualBookingLinkCreate,
    db: Session = Depends(get_db),
):
    """
    Allows an internal/admin workflow to create a
    hospital-level booking link.
    """

    hospital = db.get(
        Hospital,
        payload.hospital_id,
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    if hospital.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Hospital is inactive",
        )

    now = utc_now()

    link = BookingLink(
        hospital_id=hospital.id,
        source=payload.source,
        status="pending",
        is_active=True,
        expires_at=(
            now
            + timedelta(
                minutes=settings.BOOKING_LINK_EXPIRE_MINUTES
            )
        ),
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return _link_response(
        link=link,
        hospital=hospital,
    )


# ============================================================
# SAVE PATIENT BOOKING DETAILS
# ============================================================

@router.post("/{booking_token}/details")
def save_booking_details(
    booking_token: str,
    payload: CompleteBookingRequest,
    db: Session = Depends(get_db),
):
    """
    Save the patient's:

    - Department
    - Doctor
    - Appointment slot
    - Name
    - Phone
    - Email
    - Reason for visit

    into the existing hospital-level booking link.

    This endpoint does NOT create the appointment yet.

    Appointment/payment creation happens later.
    """

    link = _get_active_link(
        db,
        booking_token,
    )

    # --------------------------------------------------------
    # Clean patient information
    # --------------------------------------------------------

    patient_name = payload.patient_name.strip()

    patient_phone = payload.patient_phone.strip()

    reason_for_visit = (
        payload.reason_for_visit.strip()
        if payload.reason_for_visit
        else None
    )

    # --------------------------------------------------------
    # Validate patient name
    # --------------------------------------------------------

    if len(patient_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid patient name",
        )

    # --------------------------------------------------------
    # Validate phone
    # --------------------------------------------------------

    if len(patient_phone) < 7:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid phone number",
        )

    # --------------------------------------------------------
    # Validate department
    # --------------------------------------------------------

    department = db.get(
        Department,
        payload.department_id,
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found",
        )

    if department.hospital_id != link.hospital_id:
        raise HTTPException(
            status_code=400,
            detail="Department does not belong to this hospital",
        )

    if department.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Department is inactive",
        )

    # --------------------------------------------------------
    # Validate doctor
    # --------------------------------------------------------

    doctor = db.get(
        Doctor,
        payload.doctor_id,
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    if doctor.hospital_id != link.hospital_id:
        raise HTTPException(
            status_code=400,
            detail="Doctor does not belong to this hospital",
        )

    if doctor.department_id != department.id:
        raise HTTPException(
            status_code=400,
            detail="Doctor does not belong to selected department",
        )

    if doctor.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Doctor is inactive",
        )

    # --------------------------------------------------------
    # Validate appointment slot
    # --------------------------------------------------------

    slot = db.get(
        AppointmentSlot,
        payload.slot_id,
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Appointment slot not found",
        )

    if slot.doctor_id != doctor.id:
        raise HTTPException(
            status_code=400,
            detail="Slot does not belong to selected doctor",
        )

    if not slot.available:
        raise HTTPException(
            status_code=409,
            detail="Selected appointment slot is no longer available",
        )

    # --------------------------------------------------------
    # Extra date validation
    #
    # Make sure the slot date is not in the past.
    # --------------------------------------------------------

    today = datetime.now(
        timezone.utc
    ).date()

    if slot.slot_date < today:
        raise HTTPException(
            status_code=400,
            detail="Selected appointment date has already passed",
        )

    # --------------------------------------------------------
    # Save booking information
    # --------------------------------------------------------

    link.department_id = department.id

    link.doctor_id = doctor.id

    link.slot_id = slot.id

    link.patient_name = patient_name

    link.patient_phone = patient_phone

    link.patient_email = (
        str(payload.patient_email)
        if payload.patient_email
        else None
    )

    link.reason_for_visit = reason_for_visit

    link.appointment_date = slot.slot_date

    link.appointment_time = slot.start_time

    # --------------------------------------------------------
    # Consultation fee
    # --------------------------------------------------------

    link.amount = (
        doctor.consultation_fee
        if doctor.consultation_fee is not None
        else 0
    )

    link.currency = "INR"

    # --------------------------------------------------------
    # Keep booking pending until payment/confirmation
    # --------------------------------------------------------

    link.status = "pending"

    link.is_active = True

    db.commit()
    db.refresh(link)

    hospital = db.get(
        Hospital,
        link.hospital_id,
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    return _link_response(
        link=link,
        hospital=hospital,
        department=department,
        doctor=doctor,
        slot=slot,
    )


# ============================================================
# GET BOOKING LINK INFORMATION
# ============================================================

@router.get("/{booking_token}")
def get_booking(
    booking_token: str,
    db: Session = Depends(get_db),
):
    """
    Booking frontend calls this endpoint when the patient
    opens:

        /book/<TOKEN>
    """

    link = _get_active_link(
        db,
        booking_token,
    )

    hospital = db.get(
        Hospital,
        link.hospital_id,
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    department = None
    doctor = None
    slot = None

    # --------------------------------------------------------
    # Get department
    # --------------------------------------------------------

    if link.department_id:
        department = db.get(
            Department,
            link.department_id,
        )

    # --------------------------------------------------------
    # Get doctor
    # --------------------------------------------------------

    if link.doctor_id:
        doctor = db.get(
            Doctor,
            link.doctor_id,
        )

    # --------------------------------------------------------
    # Get slot
    # --------------------------------------------------------

    if link.slot_id:
        slot = db.get(
            AppointmentSlot,
            link.slot_id,
        )

    return _link_response(
        link=link,
        hospital=hospital,
        department=department,
        doctor=doctor,
        slot=slot,
    )


# ============================================================
# GET AVAILABLE SLOTS FOR BOOKING
# ============================================================

@router.get("/{booking_token}/slots")
def booking_slots(
    booking_token: str,
    doctor_id: str,
    date: str,
    db: Session = Depends(get_db),
):
    """
    Booking frontend calls this endpoint after the patient
    selects a doctor and date.

    Only slots belonging to the doctor and hospital are
    returned.

    Only available slots are returned.
    """

    link = _get_active_link(
        db,
        booking_token,
    )

    # --------------------------------------------------------
    # Validate doctor ID
    # --------------------------------------------------------

    try:
        doctor_uuid = UUID(doctor_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid doctor ID",
        )

    doctor = db.get(
        Doctor,
        doctor_uuid,
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    # --------------------------------------------------------
    # Hospital isolation
    # --------------------------------------------------------

    if doctor.hospital_id != link.hospital_id:
        raise HTTPException(
            status_code=400,
            detail="Doctor does not belong to this hospital",
        )

    if doctor.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Doctor is inactive",
        )

    # --------------------------------------------------------
    # Validate date
    # --------------------------------------------------------

    try:
        slot_date = date_type.fromisoformat(
            date
        )
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date. Use YYYY-MM-DD",
        )

    # --------------------------------------------------------
    # Don't allow dates in the past
    # --------------------------------------------------------

    today = datetime.now(
        timezone.utc
    ).date()

    if slot_date < today:
        raise HTTPException(
            status_code=400,
            detail="Cannot book an appointment for a past date",
        )

    # --------------------------------------------------------
    # Get available slots
    # --------------------------------------------------------

    slots = (
        db.query(AppointmentSlot)
        .filter(
            AppointmentSlot.doctor_id == doctor.id,
            AppointmentSlot.slot_date == slot_date,
            AppointmentSlot.available.is_(True),
        )
        .order_by(
            AppointmentSlot.start_time
        )
        .all()
    )

    return {
        "doctor_id": str(doctor.id),
        "date": slot_date.isoformat(),
        "slots": [
            {
                "id": str(slot.id),
                "time": slot.start_time.strftime("%H:%M"),
                "end_time": slot.end_time.strftime("%H:%M"),
                "available": slot.available,
            }
            for slot in slots
        ],
    }