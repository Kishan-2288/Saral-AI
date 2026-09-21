from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.appointment import PatientCreate

router = APIRouter()


@router.get("/")
def list_patients(hospital_id: str, db: Session = Depends(get_db)):
    patient_ids = db.query(Appointment.patient_id).filter(
        Appointment.hospital_id == hospital_id
    ).distinct().all()
    ids = [row[0] for row in patient_ids]
    if not ids:
        return []
    return db.query(Patient).filter(Patient.id.in_(ids)).order_by(Patient.created_at.desc()).all()


@router.post("/")
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.phone == payload.phone).order_by(Patient.created_at.desc()).first()
    if patient:
        patient.full_name = payload.full_name
        patient.email = payload.email
        patient.reason_for_visit = payload.reason_for_visit
    else:
        patient = Patient(**payload.model_dump())
        db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
