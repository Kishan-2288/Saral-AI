from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.doctor_schedule import DoctorSchedule

def has_conflict(db: Session, doctor_id: str, scheduled_at: datetime) -> bool:
    return db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.scheduled_at == scheduled_at,
        Appointment.status.in_(["pending", "confirmed"])
    ).first() is not None

def validate_slot(
    db: Session,
    doctor_id: str,
    scheduled_at: datetime,
    allow_current: datetime | None = None
) -> None:
    from fastapi import HTTPException
    schedules = db.query(DoctorSchedule).filter(
        DoctorSchedule.doctor_id == doctor_id,
        DoctorSchedule.day_of_week == scheduled_at.weekday(),
        DoctorSchedule.is_active.is_(True)
    ).all()

    if not schedules:
        raise HTTPException(400, "Doctor has no schedule for this day")

    for s in schedules:
        start = datetime.combine(scheduled_at.date(), s.start_time)
        end = datetime.combine(scheduled_at.date(), s.end_time)
        if start <= scheduled_at < end:
            minutes = int((scheduled_at - start).total_seconds() // 60)
            if minutes % s.slot_minutes == 0 and scheduled_at + timedelta(minutes=s.slot_minutes) <= end:
                return

    raise HTTPException(400, "Selected time is outside the doctor's available slots")
