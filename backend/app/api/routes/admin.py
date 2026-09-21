from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.hospital import Hospital
from app.models.patient import Patient
from app.models.staff import Staff

router = APIRouter()


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    return {
        "enterprises": (
            db.scalar(
                select(func.count())
                .select_from(Hospital)
            ) or 0
        ),

        "active_enterprises": (
            db.scalar(
                select(func.count())
                .select_from(Hospital)
                .where(Hospital.status == "active")
            ) or 0
        ),

        "staff": (
            db.scalar(
                select(func.count())
                .select_from(Staff)
            ) or 0
        ),

        "patients": (
            db.scalar(
                select(func.count())
                .select_from(Patient)
            ) or 0
        ),

        "appointments": (
            db.scalar(
                select(func.count())
                .select_from(Appointment)
            ) or 0
        ),
    }


@router.get("/analytics")
def analytics(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    since = datetime.now(timezone.utc) - timedelta(days=30)

    return {
        "appointments_last_30_days": (
            db.scalar(
                select(func.count())
                .select_from(Appointment)
                .where(Appointment.created_at >= since)
            ) or 0
        ),

        "new_enterprises_last_30_days": (
            db.scalar(
                select(func.count())
                .select_from(Hospital)
                .where(Hospital.created_at >= since)
            ) or 0
        ),

        "active_enterprises": (
            db.scalar(
                select(func.count())
                .select_from(Hospital)
                .where(Hospital.status == "active")
            ) or 0
        ),

        "total_patients": (
            db.scalar(
                select(func.count())
                .select_from(Patient)
            ) or 0
        ),

        "staff_count": (
            db.scalar(
                select(func.count())
                .select_from(Staff)
            ) or 0
        ),
    }