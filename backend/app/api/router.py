from fastapi import APIRouter

from app.api.routes import (
    appointments,
    patients,
    doctors,
    webhooks,
    ai,
    payments,
    auth,
    hospitals,
    departments,
    booking,
    admin,
    receptionist,
)

api_router = APIRouter()


# ============================================================
# Authentication
# ============================================================

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# Admin
# ============================================================

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
)


# ============================================================
# Receptionist
# ============================================================

api_router.include_router(
    receptionist.router,
    prefix="/receptionist",
    tags=["Receptionist"],
)


# ============================================================
# Hospitals / Enterprises
# ============================================================

api_router.include_router(
    hospitals.router,
    prefix="/hospitals",
    tags=["Hospitals"],
)


# ============================================================
# Departments
# ============================================================

api_router.include_router(
    departments.router,
    prefix="/departments",
    tags=["Departments"],
)


# ============================================================
# Appointments
# ============================================================

api_router.include_router(
    appointments.router,
    prefix="/appointments",
    tags=["Appointments"],
)


# ============================================================
# Patients
# ============================================================

api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["Patients"],
)


# ============================================================
# Doctors
# ============================================================

api_router.include_router(
    doctors.router,
    prefix="/doctors",
    tags=["Doctors"],
)


# ============================================================
# Payments
# ============================================================

api_router.include_router(
    payments.router,
    prefix="/payments",
    tags=["Payments"],
)


# ============================================================
# Webhooks
# ============================================================

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["Webhooks"],
)


# ============================================================
# Booking
# ============================================================

api_router.include_router(
    booking.router,
    prefix="/booking",
    tags=["Booking"],
)


# ============================================================
# AI
# ============================================================

api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI"],
)