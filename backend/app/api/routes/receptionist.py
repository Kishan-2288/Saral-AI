from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.appointment_slot import AppointmentSlot
from app.models.doctor_schedule import DoctorSchedule
from app.models.department import Department
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.models.patient import Patient
from app.models.patient_report import PatientReport
from app.schemas.admin import ReportCreate
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentReschedule,
    PatientCreate,
)
from app.services.appointment_service import has_conflict, validate_slot


router = APIRouter()


# ============================================================
# Helper Functions
# ============================================================

def hospital_filter(user: dict):
    """
    Get the hospital_id from the authenticated receptionist.

    Receptionists must always be scoped to their own hospital.
    """

    hospital_id = user.get("hospital_id")

    if not hospital_id:
        raise HTTPException(
            status_code=403,
            detail="Account is not assigned to a hospital",
        )

    return hospital_id


def scoped_appointment(
    db: Session,
    appointment_id: str,
    hospital_id,
) -> Appointment:
    """
    Get an appointment only if it belongs to the receptionist's hospital.
    """

    appointment = db.get(Appointment, appointment_id)

    if not appointment or appointment.hospital_id != hospital_id:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found",
        )

    return appointment


def scheduled_at(appointment: Appointment) -> datetime:
    """
    Combine appointment date and time into a datetime.
    """

    return datetime.combine(
        appointment.appointment_date,
        appointment.appointment_time,
    )


# ============================================================
# Dashboard
# ============================================================

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    hospital = db.get(Hospital, hospital_id)

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Hospital not found",
        )

    today = date.today()

    total_appointments = (
        db.scalar(
            select(func.count())
            .select_from(Appointment)
            .where(
                Appointment.hospital_id == hospital_id
            )
        )
        or 0
    )

    today_appointments = (
        db.scalar(
            select(func.count())
            .select_from(Appointment)
            .where(
                Appointment.hospital_id == hospital_id,
                Appointment.appointment_date == today,
            )
        )
        or 0
    )

    upcoming_appointments = (
        db.scalar(
            select(func.count())
            .select_from(Appointment)
            .where(
                Appointment.hospital_id == hospital_id,
                Appointment.appointment_date >= today,
                Appointment.status.in_(
                    [
                        "pending",
                        "confirmed",
                    ]
                ),
            )
        )
        or 0
    )

    total_patients = (
        db.scalar(
            select(func.count(func.distinct(Appointment.patient_id)))
            .select_from(Appointment)
            .where(
                Appointment.hospital_id == hospital_id,
                Appointment.patient_id.is_not(None),
            )
        )
        or 0
    )

    total_reports = (
        db.scalar(
            select(func.count())
            .select_from(PatientReport)
            .where(
                PatientReport.hospital_id == hospital_id
            )
        )
        or 0
    )

    total_doctors = (
        db.scalar(
            select(func.count())
            .select_from(Doctor)
            .where(
                Doctor.hospital_id == hospital_id,
                Doctor.status == "active",
            )
        )
        or 0
    )

    return {
        "hospital": hospital.name,
        "appointments": total_appointments,
        "today": today_appointments,
        "upcoming": upcoming_appointments,
        "patients": total_patients,
        "reports": total_reports,
        "doctors": total_doctors,
    }


# ============================================================
# Patients
# ============================================================

@router.get("/patients")
def patients(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    rows = (
        db.scalars(
            select(Patient)
            .join(
                Appointment,
                Appointment.patient_id == Patient.id,
            )
            .where(
                Appointment.hospital_id == hospital_id
            )
            .distinct()
            .order_by(Patient.created_at.desc())
        )
        .all()
    )

    return [
        {
            "id": patient.id,
            "name": patient.full_name,
            "full_name": patient.full_name,
            "phone": patient.phone,
            "email": patient.email,
            "gender": patient.gender,
            "date_of_birth": patient.date_of_birth,
            "reason_for_visit": patient.reason_for_visit,
            "created_at": patient.created_at,
        }
        for patient in rows
    ]


@router.post("/patients", status_code=201)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_filter(user)

    # The database column is `full_name`, not `name`.
    patient = Patient(
        full_name=payload.name,
        phone=payload.phone,
        email=payload.email,
    )

    db.add(patient)

    try:
        db.commit()
        db.refresh(patient)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Unable to create patient",
        )

    return {
        "id": patient.id,
        "name": patient.full_name,
        "full_name": patient.full_name,
        "phone": patient.phone,
        "email": patient.email,
        "gender": patient.gender,
        "date_of_birth": patient.date_of_birth,
        "reason_for_visit": patient.reason_for_visit,
        "created_at": patient.created_at,
    }


# ============================================================
# Doctors
# ============================================================

@router.get("/doctors")
def doctors(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    rows = (
        db.scalars(
            select(Doctor)
            .where(
                Doctor.hospital_id == hospital_id,
                Doctor.status == "active",
            )
            .order_by(Doctor.name)
        )
        .all()
    )

    result = []

    for doctor in rows:
        department_name = "—"

        if doctor.department_id:
            department = db.get(
                Department,
                doctor.department_id,
            )

            if department:
                department_name = department.name

        result.append(
            {
                "id": doctor.id,
                "name": doctor.name,
                "specialization": doctor.specialization,
                "consultation_fee": float(
                    doctor.consultation_fee or 0
                ),
                "department": department_name,
                "department_id": doctor.department_id,
                "phone": doctor.phone,
                "email": doctor.email,
                "status": doctor.status,
            }
        )

    return result


# ============================================================
# Doctor Slots
# ============================================================

@router.get("/doctors/{doctor_id}/slots")
def doctor_slots(
    doctor_id: str,
    slot_date: date,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    doctor = db.get(Doctor, doctor_id)

    if (
        not doctor
        or doctor.hospital_id != hospital_id
    ):
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    # Reuse the existing doctor slot implementation.
    from app.api.routes.doctors import get_doctor_slots

    return get_doctor_slots(
        doctor_id,
        slot_date,
        db,
    )


# ============================================================
# Doctor Schedule & Slot Management
# ============================================================

class DoctorScheduleCreate(BaseModel):
    day_of_week: int = Field(ge=0, le=6, description="Monday=0 ... Sunday=6")
    start_time: time
    end_time: time
    slot_minutes: int = Field(default=30, ge=5, le=240)
    is_active: bool = True


class DoctorScheduleStatusUpdate(BaseModel):
    is_active: bool


class SlotAvailabilityUpdate(BaseModel):
    available: bool


class GenerateSlotsRequest(BaseModel):
    from_date: date
    to_date: date


_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _scoped_doctor(db: Session, doctor_id: str, hospital_id):
    doctor = db.get(Doctor, doctor_id)
    if not doctor or str(doctor.hospital_id) != str(hospital_id):
        raise HTTPException(status_code=404, detail="Doctor not found")
    if doctor.status != "active":
        raise HTTPException(status_code=400, detail="Doctor is inactive")
    return doctor


def _active_appointment_for_slot(db: Session, slot: AppointmentSlot):
    return db.scalar(
        select(Appointment.id).where(
            or_(
                Appointment.slot_id == slot.id,
                and_(
                    Appointment.doctor_id == slot.doctor_id,
                    Appointment.appointment_date == slot.slot_date,
                    Appointment.appointment_time == slot.start_time,
                ),
            ),
            Appointment.status.in_(["pending", "confirmed", "rescheduled"]),
        ).limit(1)
    )


def _schedule_read(schedule: DoctorSchedule):
    return {
        "id": str(schedule.id),
        "doctor_id": str(schedule.doctor_id),
        "day_of_week": schedule.day_of_week,
        "day_name": _DAY_NAMES[schedule.day_of_week],
        "start_time": schedule.start_time.strftime("%H:%M"),
        "end_time": schedule.end_time.strftime("%H:%M"),
        "slot_minutes": schedule.slot_minutes,
        "is_active": schedule.is_active,
    }


@router.get("/doctors/{doctor_id}/schedules")
def list_doctor_schedules(
    doctor_id: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    schedules = db.scalars(
        select(DoctorSchedule)
        .where(DoctorSchedule.doctor_id == doctor.id)
        .order_by(DoctorSchedule.day_of_week, DoctorSchedule.start_time)
    ).all()
    return [_schedule_read(item) for item in schedules]


@router.post("/doctors/{doctor_id}/schedules", status_code=201)
def create_doctor_schedule(
    doctor_id: str,
    payload: DoctorScheduleCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    if payload.start_time >= payload.end_time:
        raise HTTPException(status_code=422, detail="End time must be later than start time")

    if payload.is_active:
        existing = db.scalars(select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor.id,
            DoctorSchedule.day_of_week == payload.day_of_week,
            DoctorSchedule.is_active.is_(True),
        )).all()
        for item in existing:
            if payload.start_time < item.end_time and payload.end_time > item.start_time:
                raise HTTPException(status_code=409, detail=f"Schedule overlaps an existing {_DAY_NAMES[payload.day_of_week]} schedule")

    schedule = DoctorSchedule(
        doctor_id=doctor.id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        slot_minutes=payload.slot_minutes,
        is_active=payload.is_active,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return _schedule_read(schedule)


@router.patch("/doctors/{doctor_id}/schedules/{schedule_id}")
def update_doctor_schedule(
    doctor_id: str,
    schedule_id: str,
    payload: DoctorScheduleStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    schedule = db.get(DoctorSchedule, schedule_id)
    if not schedule or schedule.doctor_id != doctor.id:
        raise HTTPException(status_code=404, detail="Schedule not found")

    if payload.is_active:
        existing = db.scalars(select(DoctorSchedule).where(
            DoctorSchedule.doctor_id == doctor.id,
            DoctorSchedule.day_of_week == schedule.day_of_week,
            DoctorSchedule.is_active.is_(True),
            DoctorSchedule.id != schedule.id,
        )).all()
        for item in existing:
            if schedule.start_time < item.end_time and schedule.end_time > item.start_time:
                raise HTTPException(status_code=409, detail="Cannot activate this schedule because it overlaps another schedule")

    schedule.is_active = payload.is_active
    db.commit()
    db.refresh(schedule)
    return _schedule_read(schedule)


@router.post("/doctors/{doctor_id}/slots/generate")
def generate_doctor_slots(
    doctor_id: str,
    payload: GenerateSlotsRequest,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    if payload.to_date < payload.from_date:
        raise HTTPException(status_code=422, detail="to_date must be on or after from_date")
    if (payload.to_date - payload.from_date).days > 90:
        raise HTTPException(status_code=422, detail="Generate slots for no more than 90 days at a time")
    if payload.to_date < date.today():
        raise HTTPException(status_code=422, detail="Cannot generate slots only for past dates")

    schedules = db.scalars(select(DoctorSchedule).where(
        DoctorSchedule.doctor_id == doctor.id,
        DoctorSchedule.is_active.is_(True),
    )).all()
    if not schedules:
        raise HTTPException(status_code=400, detail="Create at least one active weekly schedule first")

    existing_slots = db.scalars(select(AppointmentSlot).where(
        AppointmentSlot.doctor_id == doctor.id,
        AppointmentSlot.slot_date >= payload.from_date,
        AppointmentSlot.slot_date <= payload.to_date,
    )).all()
    by_date = {}
    for slot in existing_slots:
        by_date.setdefault(slot.slot_date, []).append(slot)

    created = 0
    skipped = 0
    now = datetime.now().time()
    for offset in range((payload.to_date - payload.from_date).days + 1):
        current_date = payload.from_date + timedelta(days=offset)
        for schedule in (s for s in schedules if s.day_of_week == current_date.weekday()):
            cursor = datetime.combine(current_date, schedule.start_time)
            end_at = datetime.combine(current_date, schedule.end_time)
            duration = timedelta(minutes=schedule.slot_minutes)
            while cursor + duration <= end_at:
                slot_start = cursor.time()
                slot_end = (cursor + duration).time()
                cursor += duration
                if current_date == date.today() and slot_start <= now:
                    skipped += 1
                    continue
                overlaps = any(
                    slot_start < existing.end_time and slot_end > existing.start_time
                    for existing in by_date.get(current_date, [])
                )
                booked_at_time = db.scalar(select(Appointment.id).where(
                    Appointment.doctor_id == doctor.id,
                    Appointment.appointment_date == current_date,
                    Appointment.appointment_time == slot_start,
                    Appointment.status.in_(["pending", "confirmed", "rescheduled"]),
                ).limit(1))
                if overlaps or booked_at_time is not None:
                    skipped += 1
                    continue
                slot = AppointmentSlot(
                    doctor_id=doctor.id,
                    slot_date=current_date,
                    start_time=slot_start,
                    end_time=slot_end,
                    available=True,
                )
                db.add(slot)
                by_date.setdefault(current_date, []).append(slot)
                created += 1
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unable to generate slots; check for duplicate or overlapping slot records")
    return {
        "doctor_id": str(doctor.id),
        "from_date": payload.from_date.isoformat(),
        "to_date": payload.to_date.isoformat(),
        "created": created,
        "skipped": skipped,
        "message": f"Created {created} slots; skipped {skipped} past, duplicate, or overlapping slots.",
    }


@router.get("/doctors/{doctor_id}/slot-calendar")
def list_doctor_slot_calendar(
    doctor_id: str,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    if to_date < from_date or (to_date - from_date).days > 90:
        raise HTTPException(status_code=422, detail="Choose a date range up to 90 days")
    slots = db.scalars(select(AppointmentSlot).where(
        AppointmentSlot.doctor_id == doctor.id,
        AppointmentSlot.slot_date >= from_date,
        AppointmentSlot.slot_date <= to_date,
    ).order_by(AppointmentSlot.slot_date, AppointmentSlot.start_time)).all()
    result = []
    for slot in slots:
        appointment_id = _active_appointment_for_slot(db, slot)
        result.append({
            "id": str(slot.id),
            "slot_date": slot.slot_date.isoformat(),
            "start_time": slot.start_time.strftime("%H:%M"),
            "end_time": slot.end_time.strftime("%H:%M"),
            "available": bool(slot.available) and appointment_id is None,
            "booked": appointment_id is not None,
        })
    return result


@router.patch("/doctors/{doctor_id}/slots/{slot_id}")
def update_doctor_slot_availability(
    doctor_id: str,
    slot_id: str,
    payload: SlotAvailabilityUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)
    doctor = _scoped_doctor(db, doctor_id, hospital_id)
    slot = db.get(AppointmentSlot, slot_id)
    if not slot or slot.doctor_id != doctor.id:
        raise HTTPException(status_code=404, detail="Slot not found")
    appointment_id = _active_appointment_for_slot(db, slot)
    if appointment_id is not None:
        raise HTTPException(status_code=409, detail="This slot has an active appointment and cannot be changed manually")
    slot.available = payload.available
    db.commit()
    return {"id": str(slot.id), "available": slot.available, "message": "Slot availability updated"}


# ============================================================
# Appointments
# ============================================================

@router.get("/appointments")
def appointments(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    rows = (
        db.scalars(
            select(Appointment)
            .where(
                Appointment.hospital_id == hospital_id
            )
            .order_by(
                Appointment.appointment_date,
                Appointment.appointment_time,
            )
        )
        .all()
    )

    result = []

    for appointment in rows:

        patient = None
        doctor = None

        if appointment.patient_id:
            patient = db.get(
                Patient,
                appointment.patient_id,
            )

        if appointment.doctor_id:
            doctor = db.get(
                Doctor,
                appointment.doctor_id,
            )

        result.append(
            {
                "id": appointment.id,
                "patient_id": appointment.patient_id,
                "patient_name": (
                    patient.full_name
                    if patient
                    else "Unknown"
                ),
                "doctor_id": appointment.doctor_id,
                "doctor_name": (
                    doctor.name
                    if doctor
                    else "Unknown"
                ),
                "scheduled_at": scheduled_at(
                    appointment
                ),
                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "status": appointment.status,
                "payment_status": appointment.payment_status,
                "consultation_fee": float(
                    appointment.consultation_fee or 0
                ),
                "slot_id": appointment.slot_id,
                "booking_link_id": getattr(
                    appointment,
                    "booking_link_id",
                    None,
                ),
                "created_at": appointment.created_at,
            }
        )

    return result


# ============================================================
# Create Appointment
# ============================================================

@router.post("/appointments", status_code=201)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    doctor = db.get(
        Doctor,
        payload.doctor_id,
    )

    patient = db.get(
        Patient,
        payload.patient_id,
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    if doctor.hospital_id != hospital_id:
        raise HTTPException(
            status_code=400,
            detail="Doctor does not belong to your hospital",
        )

    validate_slot(
        db,
        doctor.id,
        payload.scheduled_at,
    )

    matching_slot = db.scalar(select(AppointmentSlot).where(
        AppointmentSlot.doctor_id == doctor.id,
        AppointmentSlot.slot_date == payload.scheduled_at.date(),
        AppointmentSlot.start_time == payload.scheduled_at.time(),
    ).with_for_update().limit(1))
    if matching_slot and not matching_slot.available:
        raise HTTPException(status_code=409, detail="This appointment slot is unavailable")

    if has_conflict(
        db,
        doctor.id,
        payload.scheduled_at,
    ):
        raise HTTPException(
            status_code=409,
            detail="This appointment slot is already booked",
        )

    appointment = Appointment(
        hospital_id=hospital_id,
        patient_id=patient.id,
        doctor_id=doctor.id,
        slot_id=matching_slot.id if matching_slot else None,
        appointment_date=payload.scheduled_at.date(),
        appointment_time=payload.scheduled_at.time(),
        status="pending",
        payment_status="not_required",
        consultation_fee=doctor.consultation_fee,
    )

    db.add(appointment)
    if matching_slot:
        matching_slot.available = False

    try:
        db.commit()
        db.refresh(appointment)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="This appointment slot was just booked",
        )

    return appointment


# ============================================================
# Update Appointment
# ============================================================

@router.patch("/appointments/{appointment_id}/{action}")
def update_appointment(
    appointment_id: str,
    action: str,
    payload: AppointmentReschedule | None = None,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    appointment = scoped_appointment(
        db,
        appointment_id,
        hospital_id,
    )

    # --------------------------------------------------------
    # Cancel
    # --------------------------------------------------------

    if action == "cancel":
        appointment.status = "cancelled"
        if appointment.slot_id:
            old_slot = db.get(AppointmentSlot, appointment.slot_id)
            if old_slot:
                other_active = db.scalar(select(Appointment.id).where(
                    Appointment.id != appointment.id,
                    Appointment.slot_id == old_slot.id,
                    Appointment.status.in_(["pending", "confirmed", "rescheduled"]),
                ).limit(1))
                if other_active is None:
                    old_slot.available = True

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    elif action == "complete":
        appointment.status = "completed"

    # --------------------------------------------------------
    # Reschedule
    # --------------------------------------------------------

    elif action == "reschedule" and payload:

        current_scheduled_at = scheduled_at(
            appointment
        )

        validate_slot(
            db,
            appointment.doctor_id,
            payload.scheduled_at,
            allow_current=current_scheduled_at,
        )

        if has_conflict(
            db,
            appointment.doctor_id,
            payload.scheduled_at,
        ):
            raise HTTPException(
                status_code=409,
                detail="This appointment slot is already booked",
            )

        new_slot = db.scalar(select(AppointmentSlot).where(
            AppointmentSlot.doctor_id == appointment.doctor_id,
            AppointmentSlot.slot_date == payload.scheduled_at.date(),
            AppointmentSlot.start_time == payload.scheduled_at.time(),
        ).with_for_update().limit(1))
        if new_slot and not new_slot.available and new_slot.id != appointment.slot_id:
            raise HTTPException(status_code=409, detail="The new slot is unavailable")

        if appointment.slot_id and (not new_slot or new_slot.id != appointment.slot_id):
            old_slot = db.get(AppointmentSlot, appointment.slot_id)
            if old_slot:
                old_slot.available = True
        if new_slot:
            new_slot.available = False
        appointment.slot_id = new_slot.id if new_slot else None
        appointment.appointment_date = payload.scheduled_at.date()
        appointment.appointment_time = payload.scheduled_at.time()
        appointment.status = "rescheduled"

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid appointment action",
        )

    db.commit()
    db.refresh(appointment)

    return appointment


# ============================================================
# Reports
# ============================================================

@router.get("/reports")
def reports(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    rows = (
        db.scalars(
            select(PatientReport)
            .where(
                PatientReport.hospital_id == hospital_id
            )
            .order_by(
                PatientReport.created_at.desc()
            )
        )
        .all()
    )

    result = []

    for report in rows:

        patient = db.get(
            Patient,
            report.patient_id,
        )

        result.append(
            {
                "id": report.id,
                "file_name": report.report_name,
                "report_type": report.report_type,
                "file_url": report.file_url,
                "notes": report.description,
                "created_at": report.created_at,
                "patient_id": report.patient_id,
                "patient_name": (
                    patient.full_name
                    if patient
                    else "Unknown"
                ),
            }
        )

    return result


# ============================================================
# Create Report
# ============================================================

@router.post("/reports", status_code=201)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist")),
):
    hospital_id = hospital_filter(user)

    patient = db.get(
        Patient,
        payload.patient_id,
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    report = PatientReport(
        hospital_id=hospital_id,
        patient_id=patient.id,
        report_name=payload.file_name,
        file_url=payload.file_url,
        description=payload.notes,
        uploaded_by=user.get("sub"),
    )

    db.add(report)

    try:
        db.commit()
        db.refresh(report)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Unable to create report",
        )

    return report