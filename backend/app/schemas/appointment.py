from datetime import date, time
from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    hospital_id: str
    patient_id: str
    doctor_id: str
    slot_id: str | None = None
    appointment_date: date
    appointment_time: time
    consultation_fee: float = Field(ge=0)


class AppointmentRead(AppointmentCreate):
    id: str
    booking_link_id: str | None = None
    status: str
    payment_status: str


class AppointmentReschedule(BaseModel):
    appointment_date: date
    appointment_time: time
    slot_id: str | None = None


class PatientCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=7, max_length=50)
    email: str | None = None
    reason_for_visit: str | None = None
