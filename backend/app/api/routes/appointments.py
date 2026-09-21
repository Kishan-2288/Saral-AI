from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.appointment_slot import AppointmentSlot
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentReschedule

router = APIRouter()


def _read(appointment: Appointment) -> dict:
    return {
        "id": str(appointment.id),
        "hospital_id": str(appointment.hospital_id),
        "patient_id": str(appointment.patient_id),
        "doctor_id": str(appointment.doctor_id),
        "slot_id": str(appointment.slot_id) if appointment.slot_id else None,
        "booking_link_id": appointment.booking_link_id,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "consultation_fee": float(appointment.consultation_fee),
        "status": appointment.status,
        "payment_status": appointment.payment_status,
    }


@router.post("/", response_model=AppointmentRead)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    doctor = db.get(Doctor, payload.doctor_id)
    patient = db.get(Patient, payload.patient_id)
    slot = db.get(AppointmentSlot, payload.slot_id) if payload.slot_id else None

    if not doctor or doctor.status != "active":
        raise HTTPException(404, "Doctor not found")
    if not patient:
        raise HTTPException(404, "Patient not found")
    if doctor.hospital_id != payload.hospital_id:
        raise HTTPException(400, "Doctor does not belong to this hospital")
    if slot and (slot.doctor_id != doctor.id or not slot.available):
        raise HTTPException(409, "Selected slot is unavailable")

    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.appointment_time == payload.appointment_time,
        Appointment.status.in_(["pending", "confirmed"]),
    ).first()
    if conflict:
        raise HTTPException(409, "This appointment slot is already booked")

    appointment = Appointment(
        hospital_id=payload.hospital_id,
        patient_id=patient.id,
        doctor_id=doctor.id,
        slot_id=slot.id if slot else None,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        consultation_fee=payload.consultation_fee,
        status="pending",
        payment_status="pending",
    )
    db.add(appointment)
    if slot:
        slot.available = False
    try:
        db.commit()
        db.refresh(appointment)
    except Exception:
        db.rollback()
        raise HTTPException(409, "This appointment slot was just booked by another patient")
    return _read(appointment)


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    return _read(appointment)


@router.patch("/{appointment_id}/cancel", response_model=AppointmentRead)
def cancel_appointment(appointment_id: str, db: Session = Depends(get_db)):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    if appointment.status == "cancelled":
        return _read(appointment)

    appointment.status = "cancelled"
    if appointment.slot_id:
        slot = db.get(AppointmentSlot, appointment.slot_id)
        if slot:
            slot.available = True
    db.commit()
    db.refresh(appointment)
    return _read(appointment)


@router.patch("/{appointment_id}/reschedule", response_model=AppointmentRead)
def reschedule_appointment(
    appointment_id: str,
    payload: AppointmentReschedule,
    db: Session = Depends(get_db),
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    if appointment.status == "cancelled":
        raise HTTPException(400, "Cancelled appointments cannot be rescheduled")

    new_slot = db.get(AppointmentSlot, payload.slot_id) if payload.slot_id else None
    if new_slot and (new_slot.doctor_id != appointment.doctor_id or not new_slot.available):
        raise HTTPException(409, "The new slot is unavailable")

    conflict = db.query(Appointment).filter(
        Appointment.id != appointment.id,
        Appointment.doctor_id == appointment.doctor_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.appointment_time == payload.appointment_time,
        Appointment.status.in_(["pending", "confirmed"]),
    ).first()
    if conflict:
        raise HTTPException(409, "The new appointment slot is already booked")

    if appointment.slot_id:
        old_slot = db.get(AppointmentSlot, appointment.slot_id)
        if old_slot:
            old_slot.available = True

    appointment.slot_id = new_slot.id if new_slot else None
    appointment.appointment_date = payload.appointment_date
    appointment.appointment_time = payload.appointment_time
    if new_slot:
        new_slot.available = False

    db.commit()
    db.refresh(appointment)
    return _read(appointment)
