# Saral AI

WhatsApp appointment booking for clinics and hospitals. A patient messages the clinic, picks a doctor and a slot, pays, and gets a confirmation back on WhatsApp. Nobody at the front desk has to type anything.

Live:

- Website: [saral.me](https://www.saral.me/)
- Admin panel: [admin.saral.me](https://admin.saral.me/)
- Receptionist panel: [receptionist.saral.me](https://receptionist.saral.me/)

The admin and receptionist panels need an account, so you'll land on a login page.

## How it works

The chat side and the booking side are deliberately separate.

- **n8n** runs the WhatsApp conversation and the AI part: understanding what the patient wants, asking follow-up questions, handing off to a human when needed.
- **FastAPI** is the source of truth. It checks that the hospital, department, doctor and slot actually exist and are free, issues a short-lived booking link, creates the Razorpay order, verifies the payment, and only then creates the appointment.

The AI never writes to the database directly. It asks the backend, and the backend decides.

```
Patient ── WhatsApp ──> n8n (conversation + AI)
                          │
                          │ POST /api/v1/booking/n8n
                          ▼
                   FastAPI validates hospital, department, doctor, slot
                          │
                          │ creates booking_link + secure token
                          ▼
                n8n sends the booking URL on WhatsApp
                          │
                          ▼
         Booking page  /book/<token>  ── Confirm & Pay ──> Razorpay
                          │
                          │ /payments/verify  or  /webhooks/razorpay
                          ▼
     create or reuse patient → confirmed appointment → slot marked taken
                          │
                          ▼
              n8n confirmation webhook → WhatsApp message
```

Booking links expire after 15 minutes by default, so a stale link can't be paid later.

## What's in the repo

| Folder | What it is | Stack | Default port |
|---|---|---|---|
| `backend/` | API, database models, migrations, payments, n8n hooks | FastAPI, SQLAlchemy, Alembic, Postgres | 8001 |
| `frontend/` | Marketing site and demo booking | React 19, TypeScript, Tailwind 4, GSAP, small Express server | 4174 |
| `booking-frontend/` | The page patients open to confirm and pay | React, Vite | 5174 |
| `admin-frontend/` | Admin panel for enterprises, staff, analytics | React, Vite, React Router | 5173 |
| `receptionist-frontend/` | Front-desk view for patients, doctors, appointments, reports | React, Vite | 5175 |

There's also a small GitHub Action (`.github/workflows/daily-ping.yml`) that pings the hosted API once a day so the free-tier instance doesn't go to sleep.

## Running it locally

You'll need Python 3.11+, Node 20+, and a Postgres database (a local one or a Supabase project both work).

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then fill it in, see below
alembic upgrade head

python -m uvicorn app.main:app --reload --port 8001
```

Swagger docs will be at http://127.0.0.1:8001/docs and a health check at `/health`.

To create the first admin account:

```bash
python create_admin.py
```

It asks for a name, email and password, then emails a verification link. SMTP has to be configured for that to work.

### Frontends

Each one is its own app. From the folder you want:

```bash
npm install
npm run dev
```

The admin, receptionist and booking apps read `VITE_API_URL` and fall back to `http://127.0.0.1:8001` if it isn't set. The booking app expects the `/api/v1` suffix included:

```env
# booking-frontend/.env
VITE_API_URL=http://127.0.0.1:8001/api/v1
```

The landing site (`frontend/`) proxies `/api/v1` through its own Express server to `BACKEND_URL`, so the browser stays same-origin. Set `BACKEND_URL` in its `.env` if your backend isn't on 8001.

## Environment variables

Copy `backend/.env.example` and fill in what you need. The ones that matter most:

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection string (required) |
| `JWT_SECRET` | Signing login tokens. Change it from the default. |
| `SUPABASE_*` | Supabase project keys, if you use Supabase for the database |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Creating payment orders |
| `RAZORPAY_WEBHOOK_SECRET` | Verifying Razorpay webhook signatures |
| `N8N_WEBHOOK_SECRET` | Shared secret n8n sends in the `X-N8N-Secret` header |
| `N8N_APPOINTMENT_CONFIRMED_WEBHOOK_URL` | Where the backend posts once an appointment is confirmed |
| `BOOKING_FRONTEND_URL` | Base URL used when building booking links |
| `BOOKING_LINK_EXPIRE_MINUTES` | How long a booking link stays valid (default 15) |
| `WHATSAPP_*`, `INSTAGRAM_*` | Meta webhook verification and access tokens |
| `SMTP_*`, `EMAIL_FROM` | Verification emails |

Keep the Razorpay secrets and the n8n secret on the server. They should never end up in any frontend bundle.

## Booking API

This is the part n8n and the booking page talk to.

```
POST /api/v1/booking/n8n                      create a booking link (n8n only)
GET  /api/v1/booking/{token}                  details for the booking page
GET  /api/v1/booking/{token}/slots            available slots

POST /api/v1/payments/create-order            start a Razorpay order
POST /api/v1/payments/verify                  verify payment after checkout
POST /api/v1/payments/confirm-free            confirm a zero-fee booking
GET  /api/v1/payments/{payment_id}

POST /api/v1/webhooks/razorpay                signature-checked payment webhook
```

Example payload n8n sends to `POST /api/v1/booking/n8n`, with the header `X-N8N-Secret: <N8N_WEBHOOK_SECRET>`:

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

The response includes a URL like `http://localhost:5174/book/<secure-token>`, which n8n sends to the patient.

Payment is confirmed by whichever arrives first, the frontend's `/payments/verify` call or Razorpay's webhook. Both end up in the same finalize step, so a booking is never created twice.

## Roles

- **Admin**: manages enterprises (hospital groups), their staff, and sees analytics. Email-verified accounts only.
- **Receptionist / staff**: sees the day's appointments, manages patients, doctors and reports for their hospital.
- **Patient**: never logs in. They use the WhatsApp chat and a one-time booking link.

## Current state

This is an MVP and a few things are still simple on purpose:

- Intent detection in `/api/v1/ai/intent` is a keyword matcher. The real conversation logic lives in n8n.
- The app calls `create_all` on startup for convenience. Use Alembic migrations anywhere that matters.
- Instagram webhooks accept and acknowledge messages but don't do anything with them yet.

## Tests

```bash
cd backend
pytest
```

Right now that's a health-check test. There's room to add more around the booking and payment flow.

## Deployment

The booking frontend ships with a `vercel.json` that rewrites everything to `index.html`, so `/book/<token>` links work on refresh. The backend's CORS list already includes the `saral.me` production subdomains (`admin.`, `receptionist.`, `booking.`); if you deploy under a different domain, update it in `backend/app/main.py`.
