# Saral AI Backend + Booking/Payment Flow

FastAPI backend for Saral AI healthcare automation.

## Booking architecture

WhatsApp conversation and AI are handled by n8n. FastAPI owns deterministic validation, temporary booking links, Razorpay orders, payment verification and final appointment creation.

```text
Patient
  ↓
WhatsApp
  ↓
n8n conversation / AI
  ↓
POST /api/v1/booking/n8n
  ↓
Validate hospital + department + doctor + slot
  ↓
booking_links + secure token
  ↓
n8n sends booking URL
  ↓
Saral Booking frontend :5174
  ↓
GET /api/v1/booking/{token}
  ↓
Confirm & Pay
  ↓
POST /api/v1/payments/create-order
  ↓
Razorpay Checkout
  ↓
POST /api/v1/payments/verify
       OR
POST /api/v1/webhooks/razorpay
  ↓
Create/reuse patient
  ↓
Create confirmed appointment
  ↓
Mark slot unavailable
  ↓
n8n confirmation webhook
  ↓
WhatsApp confirmation
```

`booking_links` is the temporary booking/session record. There is intentionally no `booking_sessions` table.

## Endpoints

```text
POST /api/v1/booking/n8n
GET  /api/v1/booking/{booking_token}
GET  /api/v1/booking/{booking_token}/slots

POST /api/v1/payments/create-order
POST /api/v1/payments/verify
POST /api/v1/payments/confirm-free
GET  /api/v1/payments/{payment_id}

POST /api/v1/webhooks/razorpay
```

## n8n payload

```json
{
  "hospital_id": "...",
  "phone": "919876543210",
  "name": "Rahul Kumar",
  "email": "rahul@gmail.com",
  "doctor_id": "...",
  "department_id": "...",
  "slot_id": "...",
  "appointment_date": "2026-09-25",
  "appointment_time": "17:30",
  "reason_for_visit": "Chest pain",
  "source": "whatsapp"
}
```

Call:

```text
POST http://127.0.0.1:8001/api/v1/booking/n8n
X-N8N-Secret: <N8N_WEBHOOK_SECRET>
```

The response contains a URL such as:

```text
http://localhost:5174/book/<secure-token>
```

## Database migration

The existing `booking_links` table is expanded in `migrations/booking_flow.sql`.

Run the SQL once against the existing Supabase database. It adds:

- booking link doctor/department/slot/patient references
- patient details
- appointment date/time
- amount/currency/status
- expiry/update timestamps
- `appointments.booking_link_id`
- `payments.booking_link_id`
- `conversation_state.booking_link_id`

It does not create `booking_sessions` and does not create a circular `booking_links.appointment_id` foreign key.

## Environment

```env
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

BOOKING_FRONTEND_URL=http://localhost:5174
BOOKING_LINK_EXPIRE_MINUTES=15

N8N_WEBHOOK_SECRET=...
N8N_APPOINTMENT_CONFIRMED_WEBHOOK_URL=...
```

Never expose `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` or `N8N_WEBHOOK_SECRET` to the frontend.

## Run backend

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

Swagger:

```text
http://127.0.0.1:8001/docs
```
