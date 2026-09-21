import hashlib
import hmac
import json

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.payment import Payment
from app.schemas.webhook import WebhookPayload
from app.services.booking_service import finalize_paid_booking
from app.services.n8n_service import notify_appointment_confirmed

router = APIRouter()


@router.get("/whatsapp")
def whatsapp_verify(
    hub_mode: str | None = None,
    hub_verify_token: str | None = None,
    hub_challenge: str | None = None,
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        return int(hub_challenge or 0)
    raise HTTPException(403, "Webhook verification failed")


@router.post("/whatsapp")
def whatsapp_incoming(payload: dict):
    # WhatsApp conversation is handled by n8n.
    return {"received": True}


@router.post("/instagram")
def instagram_incoming(payload: dict):
    return {"received": True}


@router.post("/n8n")
def n8n_callback(payload: WebhookPayload, x_webhook_secret: str | None = Header(default=None)):
    if settings.N8N_WEBHOOK_SECRET and x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(401, "Invalid n8n webhook secret")
    return {"received": True, "event": payload.event}


def _razorpay_signature(raw_body: bytes) -> str:
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(503, "Razorpay webhook secret is not configured")
    return hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256
    ).hexdigest()


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    raw_body = await request.body()
    if not x_razorpay_signature:
        raise HTTPException(400, "Missing Razorpay signature")

    expected = _razorpay_signature(raw_body)
    if not hmac.compare_digest(expected, x_razorpay_signature):
        raise HTTPException(400, "Invalid Razorpay webhook signature")

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid webhook JSON")

    event = payload.get("event", "")
    data = payload.get("payload", {})
    payment_entity = data.get("payment", {}).get("entity", {})
    order_entity = data.get("order", {}).get("entity", {})

    order_id = payment_entity.get("order_id") or order_entity.get("id")
    payment_id = payment_entity.get("id")
    if not order_id:
        return {"received": True, "event": event}

    payment = db.query(Payment).filter(Payment.razorpay_order_id == order_id).first()
    if not payment:
        return {"received": True, "event": event, "ignored": True}

    if event in {"payment.captured", "order.paid"}:
        # A duplicate webhook for an already committed payment is harmless.
        if payment.status == "paid" and payment.appointment_id:
            return {"received": True, "event": event, "duplicate": True}

        try:
            appointment, payment, link, patient, created = finalize_paid_booking(
                db,
                booking_link_id=payment.booking_link_id,
                razorpay_payment_id=payment_id,
            )
        except HTTPException as exc:
            # A paid Razorpay transaction cannot be reversed by simply returning 4xx here.
            # Keep the payment record visible for reconciliation if the slot was lost.
            return {
                "received": True,
                "event": event,
                "booking_finalization_failed": exc.detail,
            }

        if created:
            await notify_appointment_confirmed({
                "event": "appointment.confirmed",
                "hospital_id": str(link.hospital_id),
                "booking_link_id": link.id,
                "booking_token": link.token,
                "appointment_id": str(appointment.id),
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
            })

    elif event == "payment.failed":
        payment.status = "failed"
        db.commit()

    return {"received": True, "event": event}
