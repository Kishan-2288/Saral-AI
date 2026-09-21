from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.db.session import get_db
from app.models.appointment import Appointment
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
        appointment_date=payload.scheduled_at.date(),
        appointment_time=payload.scheduled_at.time(),
        status="pending",
        payment_status="not_required",
        consultation_fee=doctor.consultation_fee,
    )

    db.add(appointment)

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

        appointment.appointment_date = (
            payload.scheduled_at.date()
        )

        appointment.appointment_time = (
            payload.scheduled_at.time()
        )

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