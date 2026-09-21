from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.appointment_slot import AppointmentSlot
from app.models.doctor import Doctor

router = APIRouter()


@router.get("/")
def list_doctors(
    hospital_id: str,
    department_id: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).filter(
        Doctor.hospital_id == hospital_id,
        Doctor.status == "active",
    )
    if department_id:
        query = query.filter(Doctor.department_id == department_id)
    return query.all()


@router.get("/{doctor_id}")
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    return doctor


@router.get("/{doctor_id}/slots")
def get_doctor_slots(
    doctor_id: str,
    slot_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
):
    doctor = db.get(Doctor, doctor_id)
    if not doctor or doctor.status != "active":
        raise HTTPException(404, "Doctor not found")

    slots = db.query(AppointmentSlot).filter(
        AppointmentSlot.doctor_id == doctor.id,
        AppointmentSlot.slot_date == slot_date,
    ).order_by(AppointmentSlot.start_time).all()

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
