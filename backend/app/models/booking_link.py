import secrets
import uuid
from datetime import date, datetime, time, timezone
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class BookingLink(Base):
    __tablename__ = "booking_links"

    id: Mapped[str] = mapped_column(String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    token: Mapped[str] = mapped_column(
        String(128), unique=True, index=True, nullable=False,
        default=lambda: secrets.token_urlsafe(32)
    )
    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("hospitals.id"), index=True, nullable=False
    )
    source: Mapped[str] = mapped_column(String(30), nullable=False, default="whatsapp")
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    doctor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctors.id"), index=True, nullable=True
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), index=True, nullable=True
    )
    slot_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("appointment_slots.id"), index=True, nullable=True
    )
    patient_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("patients.id"), index=True, nullable=True
    )

    patient_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    patient_phone: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    patient_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reason_for_visit: Mapped[str | None] = mapped_column(Text, nullable=True)
    appointment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    appointment_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
