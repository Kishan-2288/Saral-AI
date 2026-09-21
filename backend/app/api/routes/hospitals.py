from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.hospital import Hospital

router = APIRouter()


@router.get("/")
def list_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).filter(Hospital.status == "active").all()


@router.get("/{hospital_id}")
def get_hospital(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(404, "Hospital not found")
    return hospital


@router.get("/{hospital_id}/departments")
def hospital_departments(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(404, "Hospital not found")
    return db.query(Department).filter(
        Department.hospital_id == hospital_id,
        Department.status == "active",
    ).all()


@router.get("/{hospital_id}/doctors")
def hospital_doctors(hospital_id: str, db: Session = Depends(get_db)):
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(404, "Hospital not found")
    return db.query(Doctor).filter(
        Doctor.hospital_id == hospital_id,
        Doctor.status == "active",
    ).all()
