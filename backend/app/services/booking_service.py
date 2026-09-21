import uuid
from datetime import date, datetime, time, timedelta, timezone
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


def _get_booking_link(
    db: Session,
    booking_link_id: str,
) -> BookingLink:
    link = (
        db.query(BookingLink)
        .filter(BookingLink.id == booking_link_id)
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
    """
    Validate that a booking link exists and has not expired.
    """

    link = _get_booking_link(db, booking_link_id)

    if not link.is_active:
        raise HTTPException(
            status_code=400,
            detail="Booking link is inactive",
        )

    if link.expires_at and link.expires_at <= _now():
        if link.status not in {"confirmed", "paid"}:
            link.status = "expired"
            link.is_active = False
            db.commit()

        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    if link.status in {"expired", "cancelled"}:
        raise HTTPException(
            status_code=400,
            detail=f"Booking link is {link.status}",
        )

    return link


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

    # ---------------------------------------------------------
    # Hospital
    # ---------------------------------------------------------

    from app.models.hospital import Hospital
    from app.models.department import Department

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

    # ---------------------------------------------------------
    # Department
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Doctor
    # ---------------------------------------------------------

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
            detail="Doctor not found or does not belong to this department",
        )

    # ---------------------------------------------------------
    # Slot
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Secure token
    # ---------------------------------------------------------

    token = __import__("secrets").token_urlsafe(32)

    # Existing booking_links.id is VARCHAR.
    booking_id = str(uuid.uuid4())

    now = _now()
    expires_at = now + timedelta(
        minutes=settings.BOOKING_LINK_EXPIRE_MINUTES
    )

    # ---------------------------------------------------------
    # Consultation fee comes from doctor
    # ---------------------------------------------------------

    amount = Decimal(str(doctor.consultation_fee or 0))

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
        if link.status not in {"confirmed", "paid"}:
            link.status = "expired"
            link.is_active = False
            db.commit()

        raise HTTPException(
            status_code=410,
            detail="Booking link has expired",
        )

    return link


def finalize_paid_booking(
    db: Session,
    *,
    booking_link_id: str,
    razorpay_payment_id: str | None = None,
):
    """
    Finalize an appointment after successful Razorpay payment.

    This function is intentionally idempotent.

    If Razorpay sends the same webhook more than once,
    it will return the already-created appointment instead
    of creating a duplicate appointment.
    """

    # ---------------------------------------------------------
    # Booking link
    # ---------------------------------------------------------

    link = _get_booking_link(
        db,
        booking_link_id,
    )

    # ---------------------------------------------------------
    # Already finalized
    # ---------------------------------------------------------

    existing_appointment = (
        db.query(Appointment)
        .filter(
            Appointment.booking_link_id == link.id,
        )
        .first()
    )

    if existing_appointment:
        payment = (
            db.query(Payment)
            .filter(
                Payment.appointment_id == existing_appointment.id,
            )
            .first()
        )

        patient = (
            db.query(Patient)
            .filter(
                Patient.id == existing_appointment.patient_id,
            )
            .first()
        )

        return (
            existing_appointment,
            payment,
            link,
            patient,
            False,
        )

    # ---------------------------------------------------------
    # Validate booking status
    # ---------------------------------------------------------

    if link.status in {"expired", "cancelled"}:
        raise HTTPException(
            status_code=400,
            detail=f"Booking link is {link.status}",
        )

    # ---------------------------------------------------------
    # Slot
    # ---------------------------------------------------------

    slot = (
        db.query(AppointmentSlot)
        .filter(
            AppointmentSlot.id == link.slot_id,
        )
        .with_for_update()
        .first()
    )

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Appointment slot not found",
        )

    # ---------------------------------------------------------
    # Prevent double booking
    #
    # Lock the slot row before checking availability.
    # ---------------------------------------------------------

    if not slot.available:
        # Check whether another appointment already owns it.
        existing_slot_appointment = (
            db.query(Appointment)
            .filter(
                Appointment.slot_id == slot.id,
                Appointment.status.in_(
                    ["pending", "confirmed"]
                ),
            )
            .first()
        )

        if existing_slot_appointment:
            raise HTTPException(
                status_code=409,
                detail="Appointment slot has already been booked",
            )

        raise HTTPException(
            status_code=409,
            detail="Appointment slot is no longer available",
        )

    # ---------------------------------------------------------
    # Patient
    # ---------------------------------------------------------

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

    else:
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

    # ---------------------------------------------------------
    # Appointment
    # ---------------------------------------------------------

    appointment = Appointment(
        id=uuid.uuid4(),
        hospital_id=link.hospital_id,
        doctor_id=link.doctor_id,
        patient_id=patient.id,
        slot_id=link.slot_id,
        booking_link_id=link.id,
        appointment_date=link.appointment_date,
        appointment_time=link.appointment_time,
        status="confirmed",
        payment_status="paid",
        consultation_fee=link.amount,
        created_at=_now(),
        updated_at=_now(),
    )

    db.add(appointment)
    db.flush()

    # ---------------------------------------------------------
    # Payment
    # ---------------------------------------------------------

    payment = (
        db.query(Payment)
        .filter(
            Payment.appointment_id == appointment.id,
        )
        .first()
    )

    if payment:
        payment.status = "paid"

        if razorpay_payment_id:
            payment.razorpay_payment_id = razorpay_payment_id

        payment.updated_at = _now()

    # ---------------------------------------------------------
    # Mark slot unavailable
    # ---------------------------------------------------------

    slot.available = False

    # ---------------------------------------------------------
    # Update booking link
    # ---------------------------------------------------------

    link.status = "confirmed"
    link.is_active = False
    link.updated_at = _now()

    db.commit()

    db.refresh(appointment)
    db.refresh(link)

    if patient:
        db.refresh(patient)

    if payment:
        db.refresh(payment)

    return (
        appointment,
        payment,
        link,
        patient,
        True,
    )