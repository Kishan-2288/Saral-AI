from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.department import Department

router = APIRouter()


@router.get("/")
def list_departments(hospital_id: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Department).filter(Department.status == "active")
    if hospital_id:
        query = query.filter(Department.hospital_id == hospital_id)
    return query.all()


@router.get("/{department_id}")
def get_department(department_id: str, db: Session = Depends(get_db)):
    department = db.get(Department, department_id)
    if not department:
        raise HTTPException(404, "Department not found")
    return department
