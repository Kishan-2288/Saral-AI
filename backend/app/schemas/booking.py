from datetime import date, time, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# n8n → FastAPI
# ============================================================

class N8NBookingRequest(BaseModel):
    """
    Data collected by n8n from the WhatsApp conversation.

    FastAPI validates all IDs against the database before
    creating a booking link.
    """

    hospital_id: UUID

    phone: str = Field(
        ...,
        min_length=5,
        max_length=50,
    )

    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    email: EmailStr | None = None

    doctor_id: UUID
    department_id: UUID
    slot_id: UUID

    appointment_date: date
    appointment_time: time

    reason_for_visit: str | None = Field(
        default=None,
        max_length=2000,
    )

    source: str = Field(
        default="whatsapp",
        max_length=50,
    )


# ============================================================
# Backward-compatible alias
# ============================================================
#
# Some older code may use N8nBookingRequest instead of
# N8NBookingRequest. Keep the alias so both names work.
#

N8nBookingRequest = N8NBookingRequest


# ============================================================
# Patient information
# ============================================================

class BookingPatientRead(BaseModel):
    """
    Patient information returned as part of a booking.
    """

    id: UUID | None = None

    name: str | None = None

    phone: str | None = None

    email: EmailStr | None = None

    reason_for_visit: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================
# Manual booking link creation
# ============================================================

class ManualBookingLinkCreate(BaseModel):
    """
    Used by admin/receptionist/internal systems to create
    a basic booking link manually.
    """

    hospital_id: UUID

    source: str = Field(
        default="manual",
        max_length=50,
    )


# ============================================================
# Booking Link response
# ============================================================

class BookingLinkResponse(BaseModel):
    id: str

    token: str

    booking_url: str

    hospital_id: UUID

    doctor_id: UUID

    department_id: UUID

    slot_id: UUID

    patient_name: str

    patient_phone: str

    patient_email: EmailStr | None = None

    reason_for_visit: str | None = None

    appointment_date: date

    appointment_time: time

    amount: Decimal

    currency: str

    status: str

    expires_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# n8n booking response
# ============================================================

class N8NBookingResponse(BaseModel):
    """
    Response returned to n8n after successfully creating
    a booking link.
    """

    success: bool

    booking_link_id: str

    booking_url: str

    expires_at: datetime

    amount: Decimal

    currency: str


# Backward-compatible alias
N8nBookingResponse = N8NBookingResponse


# ============================================================
# Public booking page
# ============================================================

class PublicBookingResponse(BaseModel):
    """
    Information displayed by the public Saral Booking page.
    """

    success: bool

    booking_link_id: str

    hospital_id: UUID

    doctor_id: UUID

    department_id: UUID

    patient_name: str

    patient_phone: str

    patient_email: EmailStr | None = None

    reason_for_visit: str | None = None

    appointment_date: date

    appointment_time: time

    amount: Decimal

    currency: str

    status: str

    expires_at: datetime


# ============================================================
# Razorpay order creation
# ============================================================

class CreatePaymentOrderRequest(BaseModel):
    """
    Request from the booking frontend to create a Razorpay
    order.
    """

    booking_token: str = Field(
        ...,
        min_length=10,
        max_length=500,
    )


class CreatePaymentOrderResponse(BaseModel):
    """
    Razorpay order information returned to the frontend.
    """

    success: bool

    order_id: str

    amount: int

    currency: str

    razorpay_key_id: str

    booking_link_id: str


# ============================================================
# Razorpay payment verification
# ============================================================

class VerifyPaymentRequest(BaseModel):
    """
    Payment information returned by Razorpay and sent to
    the backend for server-side signature verification.
    """

    booking_token: str = Field(
        ...,
        min_length=10,
        max_length=500,
    )

    razorpay_order_id: str

    razorpay_payment_id: str

    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    """
    Result of Razorpay payment verification.
    """

    success: bool

    appointment_id: UUID | None = None

    payment_id: UUID | None = None

    booking_link_id: str

    message: str


# ============================================================
# Free / no-payment confirmation
# ============================================================

class ConfirmBookingRequest(BaseModel):
    """
    Used when the consultation does not require payment.
    """

    booking_token: str = Field(
        ...,
        min_length=10,
        max_length=500,
    )


class ConfirmBookingResponse(BaseModel):
    """
    Result after confirming a booking without payment.
    """

    success: bool

    appointment_id: UUID

    booking_link_id: str

    message: str


# ============================================================
# Generic booking result
# ============================================================

class BookingDetails(BaseModel):
    """
    Common booking information used internally or returned
    by booking/payment APIs.
    """

    booking_link_id: str

    hospital_id: UUID

    doctor_id: UUID

    department_id: UUID

    patient_name: str

    patient_phone: str

    patient_email: EmailStr | None = None

    appointment_date: date

    appointment_time: time

    amount: Decimal

    currency: str

    status: str

    expires_at: datetime