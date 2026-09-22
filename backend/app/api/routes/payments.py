from decimal import Decimal
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.booking_link import BookingLink
from app.models.payment import Payment
from app.services.booking_service import (
    create_pending_appointment_for_payment,
    finalize_paid_booking,
)
from app.services.n8n_service import notify_appointment_confirmed
from app.services.payment_service import verify_razorpay_signature


router = APIRouter()


class PaymentOrderCreate(BaseModel):
    booking_token: str


class PaymentVerify(BaseModel):
    booking_token: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class FreeBookingConfirm(BaseModel):
    booking_token: str


async def _razorpay_create_order(
    amount: Decimal,
    currency: str,
    receipt: str,
    notes: dict,
) -> dict:

    if (
        not settings.RAZORPAY_KEY_ID
        or not settings.RAZORPAY_KEY_SECRET
    ):
        raise HTTPException(
            503,
            "Razorpay is not configured",
        )

    paise = int(amount * Decimal("100"))

    async with httpx.AsyncClient(timeout=20) as client:

        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            ),
            json={
                "amount": paise,
                "currency": currency,
                "receipt": receipt[:40],
                "notes": notes,
            },
        )

    if response.status_code >= 400:

        detail = "Razorpay order creation failed"

        try:
            detail = (
                response.json()
                .get("error", {})
                .get("description")
                or detail
            )
        except Exception:
            pass

        raise HTTPException(
            502,
            detail,
        )

    return response.json()


def _active_link(
    db: Session,
    token: str,
) -> BookingLink:

    from app.api.routes.booking import _get_active_link

    return _get_active_link(
        db,
        token,
    )


def _confirmation_payload(
    appointment,
    payment,
    link,
    patient,
) -> dict:

    return {
        "event": "appointment.confirmed",

        "hospital_id": str(
            link.hospital_id
        ),

        "booking_link_id": link.id,

        "booking_token": link.token,

        "appointment_id": str(
            appointment.id
        ),

        "patient": {
            "name": patient.full_name,
            "phone": patient.phone,
            "email": patient.email,
        },

        "appointment": {
            "date": appointment.appointment_date.isoformat(),
            "time": appointment.appointment_time.strftime("%H:%M"),
        },

        "payment": {
            "status": payment.status,
            "payment_id": payment.razorpay_payment_id,
            "amount": str(payment.amount),
            "currency": payment.currency,
        },
    }


# ============================================================
# CREATE RAZORPAY ORDER
# ============================================================

@router.post("/create-order")
async def create_order(
    payload: PaymentOrderCreate,
    db: Session = Depends(get_db),
):

    link = _active_link(
        db,
        payload.booking_token,
    )

    if link.status not in {
        "pending",
        "payment_pending",
    }:
        raise HTTPException(
            400,
            f"Booking is already {link.status}",
        )

    if (
        not link.doctor_id
        or not link.slot_id
        or not link.patient_name
        or not link.patient_phone
    ):
        raise HTTPException(
            400,
            "Booking information is incomplete",
        )

    from app.models.appointment_slot import AppointmentSlot
    from app.models.doctor import Doctor

    doctor = db.get(
        Doctor,
        link.doctor_id,
    )

    slot = db.get(
        AppointmentSlot,
        link.slot_id,
    )

    if (
        not doctor
        or doctor.status != "active"
        or not slot
    ):
        raise HTTPException(
            409,
            "Selected appointment slot is no longer available",
        )

    amount = Decimal(
        str(
            link.amount
            if link.amount is not None
            else doctor.consultation_fee or 0
        )
    )

    if amount <= 0:

        raise HTTPException(
            400,
            "This booking has no payment amount. Use the free-booking confirmation endpoint.",
        )

    # ---------------------------------------------------------
    # Existing payment
    # ---------------------------------------------------------

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.booking_link_id == link.id,
            Payment.status.in_(
                ["created", "pending"]
            ),
        )
        .order_by(
            Payment.created_at.desc()
        )
        .first()
    )

    if (
        existing_payment
        and existing_payment.razorpay_order_id
    ):

        link.status = "payment_pending"

        db.commit()

        return {
            "provider": "razorpay",
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": existing_payment.razorpay_order_id,
            "amount": int(
                existing_payment.amount * 100
            ),
            "currency": existing_payment.currency,
            "booking_token": link.token,
            "payment_id": str(
                existing_payment.id
            ),
        }

    # ---------------------------------------------------------
    # IMPORTANT:
    # Create appointment BEFORE payment.
    #
    # payments.appointment_id is NOT NULL.
    # ---------------------------------------------------------

    appointment, patient, link = (
        create_pending_appointment_for_payment(
            db,
            booking_link_id=link.id,
        )
    )

    # ---------------------------------------------------------
    # Create Razorpay order
    # ---------------------------------------------------------

    order = await _razorpay_create_order(
        amount,
        link.currency,
        f"booking_{link.id[:28]}",
        {
            "booking_link_id": link.id,
            "hospital_id": str(
                link.hospital_id
            ),
            "appointment_id": str(
                appointment.id
            ),
        },
    )

    # ---------------------------------------------------------
    # Create payment
    # ---------------------------------------------------------

    payment = Payment(
        hospital_id=link.hospital_id,
        appointment_id=appointment.id,
        booking_link_id=link.id,
        amount=amount,
        currency=link.currency,
        razorpay_order_id=order["id"],
        status="created",
    )

    db.add(payment)

    appointment.payment_status = "pending"

    link.status = "payment_pending"

    db.commit()

    db.refresh(payment)
    db.refresh(appointment)

    return {
        "provider": "razorpay",
        "key_id": settings.RAZORPAY_KEY_ID,
        "order_id": order["id"],
        "amount": int(
            amount * 100
        ),
        "currency": link.currency,
        "booking_token": link.token,
        "payment_id": str(
            payment.id
        ),
        "appointment_id": str(
            appointment.id
        ),
    }


# ============================================================
# VERIFY RAZORPAY PAYMENT
# ============================================================

@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    db: Session = Depends(get_db),
):

    link = (
        db.query(BookingLink)
        .filter(
            BookingLink.token
            == payload.booking_token
        )
        .first()
    )

    if not link:
        raise HTTPException(
            404,
            "Booking link not found",
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.razorpay_order_id
            == payload.razorpay_order_id,

            Payment.booking_link_id
            == link.id,
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            400,
            "Payment order not found for this booking",
        )

    if not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            503,
            "Razorpay secret is not configured",
        )

    valid_signature = (
        verify_razorpay_signature(
            payload.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
            settings.RAZORPAY_KEY_SECRET,
        )
    )

    if not valid_signature:
        raise HTTPException(
            400,
            "Invalid Razorpay signature",
        )

    appointment, payment, link, patient, created = (
        finalize_paid_booking(
            db,
            booking_link_id=link.id,
            razorpay_payment_id=payload.razorpay_payment_id,
            razorpay_signature=payload.razorpay_signature,
        )
    )

    notification_sent = False

    if created:

        notification_sent = (
            await notify_appointment_confirmed(
                _confirmation_payload(
                    appointment,
                    payment,
                    link,
                    patient,
                )
            )
        )

    return {
        "verified": True,
        "duplicate": not created,
        "booking_token": link.token,
        "appointment_id": str(
            appointment.id
        ),
        "payment_id": (
            payment.razorpay_payment_id
            if payment
            else None
        ),
        "appointment_status": appointment.status,
        "payment_status": appointment.payment_status,
        "notification_sent": notification_sent,
    }


# ============================================================
# FREE BOOKING
# ============================================================

@router.post("/confirm-free")
async def confirm_free_booking(
    payload: FreeBookingConfirm,
    db: Session = Depends(get_db),
):

    link = _active_link(
        db,
        payload.booking_token,
    )

    if link.status not in {
        "pending",
        "payment_pending",
    }:
        raise HTTPException(
            400,
            f"Booking is already {link.status}",
        )

    if (
        not link.doctor_id
        or not link.slot_id
        or not link.patient_name
        or not link.patient_phone
    ):
        raise HTTPException(
            400,
            "Booking information is incomplete",
        )

    # ---------------------------------------------------------
    # Appointment is created FIRST.
    # ---------------------------------------------------------

    appointment, patient, link = (
        create_pending_appointment_for_payment(
            db,
            booking_link_id=link.id,
        )
    )

    # ---------------------------------------------------------
    # Finalize as free booking.
    #
    # This creates the Payment AFTER the appointment exists.
    # ---------------------------------------------------------

    appointment, payment, link, patient, created = (
        finalize_paid_booking(
            db,
            booking_link_id=link.id,
            razorpay_payment_id=None,
            razorpay_signature=None,
            free_booking=True,
        )
    )

    notification_sent = False

    if created:

        notification_sent = (
            await notify_appointment_confirmed(
                _confirmation_payload(
                    appointment,
                    payment,
                    link,
                    patient,
                )
            )
        )

    return {
        "confirmed": True,
        "appointment_id": str(
            appointment.id
        ),
        "payment_id": (
            str(payment.id)
            if payment
            else None
        ),
        "payment_status": "not_required",
        "notification_sent": notification_sent,
    }


# ============================================================
# GET PAYMENT
# ============================================================

@router.get("/{payment_id}")
def get_payment(payment_id: UUID, db: Session = Depends(get_db)):
    payment = db.get(Payment, payment_id)

    if not payment:
        raise HTTPException(404, "Payment not found")

    return payment