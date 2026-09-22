import secrets
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.appointment import Appointment
from app.models.appointment_slot import AppointmentSlot
from app.models.booking_link import BookingLink
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.payment import Payment


def _now() -> datetime:
    return datetime.now(timezone.utc)


# =========================================================
# BOOKING LINK HELPERS
# =========================================================

def _get_booking_link(
    db: Session,
    booking_link_id: str,
) -> BookingLink:

    link = (
        db.query(BookingLink)
        .filter(
            BookingLink.id == booking_link_id,
        )
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=404,
            detail="Booking link not found",
        )

    return link


def validate_booking_link(
    db: Session,
    booking_link_id: str,
) -> BookingLink:

    link = _get_booking_link(
        db,
        booking_link_id,
    )

    if not link.is_active:
        raise HTTPException(
            status_code=400,
            detail="Booking link is inactive",
        )

    if link.expires_at and link.expires_at <= _now():

        if link.status not in {
            "confirmed",
            "paid",
        }:
            link.status = "expired"
            link.is_active = False
            db.commit()

        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    if link.status in {
        "expired",
        "cancelled",
    }:
        raise HTTPException(
            status_code=400,
            detail=f"Booking link is {link.status}",
        )

    return link


# =========================================================
# CREATE BOOKING LINK
# =========================================================

def create_booking_link(
    db: Session,
    *,
    hospital_id: uuid.UUID,
    doctor_id: uuid.UUID,
    department_id: uuid.UUID,
    slot_id: uuid.UUID,
    patient_name: str,
    patient_phone: str,
    patient_email: str | None,
    reason_for_visit: str | None,
    source: str = "whatsapp",
) -> BookingLink:

    from app.models.hospital import Hospital
    from app.models.department import Department

    # -----------------------------------------------------
    # Hospital
    # -----------------------------------------------------

    hospital = (
        db.query(Hospital)
        .filter(
            Hospital.id == hospital_id,
            Hospital.status == "active",
        )
        .first()
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Active hospital not found",
        )

    # -----------------------------------------------------
    # Department
    # -----------------------------------------------------

    department = (
        db.query(Department)
        .filter(
            Department.id == department_id,
            Department.hospital_id == hospital_id,
        )
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found for this hospital",
        )

    # -----------------------------------------------------
    # Doctor
    # -----------------------------------------------------

    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.hospital_id == hospital_id,
            Doctor.department_id == department_id,
            Doctor.status == "active",
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail=(
                "Doctor not found or does not belong "
                "to this department"
            ),
        )

    # -----------------------------------------------------
    # Slot
    # -----------------------------------------------------

    slot = (
        db.query(AppointmentSlot)
        .filter(
            AppointmentSlot.id == slot_id,
            AppointmentSlot.doctor_id == doctor_id,
        )
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Appointment slot not found",
        )

    if not slot.available:
        raise HTTPException(
            status_code=409,
            detail="Appointment slot is no longer available",
        )

    # -----------------------------------------------------
    # Booking token
    # -----------------------------------------------------

    token = secrets.token_urlsafe(32)
    booking_id = str(uuid.uuid4())

    now = _now()

    expires_at = now + timedelta(
        minutes=settings.BOOKING_LINK_EXPIRE_MINUTES
    )

    # -----------------------------------------------------
    # Consultation fee
    # -----------------------------------------------------

    amount = Decimal(
        str(
            doctor.consultation_fee
            if doctor.consultation_fee is not None
            else 0
        )
    )

    # -----------------------------------------------------
    # Booking link
    # -----------------------------------------------------

    link = BookingLink(
        id=booking_id,
        token=token,
        hospital_id=hospital_id,
        source=source,
        is_active=True,

        doctor_id=doctor_id,
        department_id=department_id,
        slot_id=slot_id,

        patient_name=patient_name,
        patient_phone=patient_phone,
        patient_email=patient_email,
        reason_for_visit=reason_for_visit,

        appointment_date=slot.slot_date,
        appointment_time=slot.start_time,

        amount=amount,
        currency="INR",

        status="pending",

        expires_at=expires_at,
        created_at=now,
        updated_at=now,
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    return link


# =========================================================
# GET BOOKING BY TOKEN
# =========================================================

def get_booking_by_token(
    db: Session,
    token: str,
) -> BookingLink:

    link = (
        db.query(BookingLink)
        .filter(
            BookingLink.token == token,
            BookingLink.is_active.is_(True),
        )
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=404,
            detail="Booking link not found",
        )

    if link.expires_at and link.expires_at <= _now():

        if link.status not in {
            "confirmed",
            "paid",
        }:
            link.status = "expired"
            link.is_active = False
            db.commit()

        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    return link


# =========================================================
# PATIENT
# =========================================================

def _get_or_create_patient(
    db: Session,
    link: BookingLink,
) -> Patient:

    patient = (
        db.query(Patient)
        .filter(
            Patient.phone == link.patient_phone,
        )
        .first()
    )

    if patient:

        patient.full_name = link.patient_name

        if link.patient_email:
            patient.email = link.patient_email

        if link.reason_for_visit:
            patient.reason_for_visit = link.reason_for_visit

        patient.updated_at = _now()

        return patient

    patient = Patient(
        id=uuid.uuid4(),
        full_name=link.patient_name,
        phone=link.patient_phone,
        email=link.patient_email,
        reason_for_visit=link.reason_for_visit,
        created_at=_now(),
        updated_at=_now(),
    )

    db.add(patient)
    db.flush()

    return patient


# =========================================================
# LOCK APPOINTMENT SLOT
# =========================================================

def _get_locked_slot(
    db: Session,
    link: BookingLink,
) -> AppointmentSlot:

    if not link.slot_id:
        raise HTTPException(
            status_code=400,
            detail="Appointment slot has not been selected",
        )

    slot = (
        db.query(AppointmentSlot)
        .filter(
            AppointmentSlot.id == link.slot_id,
            AppointmentSlot.doctor_id == link.doctor_id,
        )
        .with_for_update()
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Appointment slot not found",
        )

    return slot


# =========================================================
# CREATE PENDING APPOINTMENT
# =========================================================

def create_pending_appointment_for_payment(
    db: Session,
    *,
    booking_link_id: str,
) -> tuple[Appointment, Patient, BookingLink]:

    link = validate_booking_link(
        db,
        booking_link_id,
    )

    if link.status in {
        "expired",
        "cancelled",
        "confirmed",
        "paid",
    }:
        raise HTTPException(
            status_code=400,
            detail=f"Booking is already {link.status}",
        )

    if not link.doctor_id or not link.slot_id:
        raise HTTPException(
            status_code=400,
            detail="Doctor and appointment slot must be selected",
        )

    if not link.patient_name or not link.patient_phone:
        raise HTTPException(
            status_code=400,
            detail="Patient information is incomplete",
        )

    # -----------------------------------------------------
    # Reuse existing appointment
    # -----------------------------------------------------

    existing = (
        db.query(Appointment)
        .filter(
            Appointment.booking_link_id == link.id,
        )
        .first()
    )

    if existing:

        if existing.status == "cancelled":
            raise HTTPException(
                status_code=400,
                detail="Existing appointment is cancelled",
            )

        patient = db.get(
            Patient,
            existing.patient_id,
        )

        if not patient:
            raise HTTPException(
                status_code=500,
                detail="Appointment patient record not found",
            )

        return existing, patient, link

    # -----------------------------------------------------
    # Lock slot
    # -----------------------------------------------------

    slot = _get_locked_slot(
        db,
        link,
    )

    # -----------------------------------------------------
    # Check whether slot is already booked
    # -----------------------------------------------------

    existing_slot_appointment = (
        db.query(Appointment)
        .filter(
            Appointment.slot_id == slot.id,
            Appointment.status.in_(
                [
                    "pending",
                    "confirmed",
                ]
            ),
        )
        .first()
    )

    if existing_slot_appointment:
        raise HTTPException(
            status_code=409,
            detail="Appointment slot has already been booked",
        )

    if not slot.available:
        raise HTTPException(
            status_code=409,
            detail="Appointment slot is no longer available",
        )

    # -----------------------------------------------------
    # Validate slot date/time against booking link
    # -----------------------------------------------------

    if (
        link.appointment_date != slot.slot_date
        or link.appointment_time != slot.start_time
    ):
        raise HTTPException(
            status_code=409,
            detail="Selected appointment slot has changed",
        )

    # -----------------------------------------------------
    # Patient
    # -----------------------------------------------------

    patient = _get_or_create_patient(
        db,
        link,
    )

    # -----------------------------------------------------
    # Appointment
    #
    # IMPORTANT:
    # payments.appointment_id is NOT NULL.
    # Therefore appointment must exist before Payment.
    # -----------------------------------------------------

    appointment = Appointment(
        id=uuid.uuid4(),
        hospital_id=link.hospital_id,
        doctor_id=link.doctor_id,
        patient_id=patient.id,
        slot_id=slot.id,
        booking_link_id=link.id,

        appointment_date=slot.slot_date,
        appointment_time=slot.start_time,

        status="pending",
        payment_status="pending",

        consultation_fee=Decimal(
            str(link.amount or 0)
        ),

        created_at=_now(),
        updated_at=_now(),
    )

    db.add(appointment)
    db.flush()

    return appointment, patient, link


# =========================================================
# FINALIZE PAID / FREE BOOKING
# =========================================================

def finalize_paid_booking(
    db: Session,
    *,
    booking_link_id: str,
    razorpay_payment_id: str | None = None,
    razorpay_signature: str | None = None,
    free_booking: bool = False,
):

    # -----------------------------------------------------
    # Booking link
    # -----------------------------------------------------

    link = _get_booking_link(
        db,
        booking_link_id,
    )

    # -----------------------------------------------------
    # Already confirmed?
    #
    # This makes the operation idempotent.
    # -----------------------------------------------------

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.booking_link_id == link.id,
        )
        .first()
    )

    if appointment and appointment.status == "confirmed":

        payment = (
            db.query(Payment)
            .filter(
                Payment.appointment_id == appointment.id,
            )
            .order_by(
                Payment.created_at.desc()
            )
            .first()
        )

        patient = db.get(
            Patient,
            appointment.patient_id,
        )

        if not patient:
            raise HTTPException(
                status_code=500,
                detail="Patient record not found",
            )

        return (
            appointment,
            payment,
            link,
            patient,
            False,
        )

    # -----------------------------------------------------
    # Validate booking link
    # -----------------------------------------------------

    if not link.is_active and link.status not in {
        "payment_pending",
        "pending",
    }:
        raise HTTPException(
            status_code=400,
            detail="Booking link is no longer active",
        )

    if link.expires_at and link.expires_at <= _now():
        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    # -----------------------------------------------------
    # Create appointment if necessary
    # -----------------------------------------------------

    if not appointment:

        appointment, patient, link = (
            create_pending_appointment_for_payment(
                db,
                booking_link_id=link.id,
            )
        )

    else:

        patient = (
            db.query(Patient)
            .filter(
                Patient.id == appointment.patient_id,
            )
            .first()
        )

        if not patient:
            raise HTTPException(
                status_code=500,
                detail="Patient record not found",
            )

    # -----------------------------------------------------
    # Lock slot
    # -----------------------------------------------------

    slot = _get_locked_slot(
        db,
        link,
    )

    # -----------------------------------------------------
    # Make sure this appointment owns the slot
    # -----------------------------------------------------

    if appointment.slot_id != slot.id:
        raise HTTPException(
            status_code=409,
            detail="Appointment slot does not match booking",
        )

    # -----------------------------------------------------
    # Check doctor
    # -----------------------------------------------------

    doctor = db.get(
        Doctor,
        link.doctor_id,
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    if doctor.status != "active":
        raise HTTPException(
            status_code=409,
            detail="Doctor is no longer active",
        )

    # -----------------------------------------------------
    # Check payment amount
    # -----------------------------------------------------

    expected_amount = Decimal(
        str(link.amount or 0)
    )

    if appointment.consultation_fee != expected_amount:
        appointment.consultation_fee = expected_amount

    # -----------------------------------------------------
    # Payment
    # -----------------------------------------------------

    payment = (
        db.query(Payment)
        .filter(
            Payment.appointment_id == appointment.id,
        )
        .order_by(
            Payment.created_at.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # Create payment record if needed
    # -----------------------------------------------------

    if not payment:

        payment = Payment(
            id=uuid.uuid4(),
            appointment_id=appointment.id,
            booking_link_id=link.id,
            hospital_id=link.hospital_id,

            amount=Decimal(
                "0.00"
                if free_booking
                else str(expected_amount)
            ),

            currency=link.currency or "INR",

            razorpay_payment_id=(
                None
                if free_booking
                else razorpay_payment_id
            ),

            razorpay_signature=(
                None
                if free_booking
                else razorpay_signature
            ),

            status="paid",

            created_at=_now(),
            updated_at=_now(),
        )

        db.add(payment)

    else:

        if free_booking:

            payment.amount = Decimal("0.00")
            payment.razorpay_payment_id = None
            payment.razorpay_signature = None

        else:

            if razorpay_payment_id:
                payment.razorpay_payment_id = (
                    razorpay_payment_id
                )

            if razorpay_signature:
                payment.razorpay_signature = (
                    razorpay_signature
                )

        payment.status = "paid"
        payment.updated_at = _now()

    # -----------------------------------------------------
    # Appointment payment status
    # -----------------------------------------------------

    if free_booking:

        appointment.payment_status = "not_required"

    else:

        appointment.payment_status = "paid"

    # -----------------------------------------------------
    # Confirm appointment
    # -----------------------------------------------------

    appointment.status = "confirmed"
    appointment.updated_at = _now()

    # -----------------------------------------------------
    # Check slot ownership
    # -----------------------------------------------------

    if not slot.available:

        existing_slot_appointment = (
            db.query(Appointment)
            .filter(
                Appointment.slot_id == slot.id,
                Appointment.status.in_(
                    [
                        "pending",
                        "confirmed",
                    ]
                ),
            )
            .first()
        )

        if (
            existing_slot_appointment
            and existing_slot_appointment.id
            != appointment.id
        ):
            raise HTTPException(
                status_code=409,
                detail="Appointment slot has already been booked",
            )

    # -----------------------------------------------------
    # Mark slot unavailable
    # -----------------------------------------------------

    slot.available = False

    # -----------------------------------------------------
    # Booking link
    # -----------------------------------------------------

    link.status = "confirmed"
    link.is_active = False
    link.updated_at = _now()

    # -----------------------------------------------------
    # Commit everything together
    # -----------------------------------------------------

    db.commit()

    db.refresh(appointment)
    db.refresh(payment)
    db.refresh(link)
    db.refresh(patient)

    return (
        appointment,
        payment,
        link,
        patient,
        True,
    )