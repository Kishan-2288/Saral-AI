import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ConversationState(Base):
    __tablename__ = "conversation_state"

    # ---------------------------------------------------------
    # Composite primary key
    # ---------------------------------------------------------
    phone: Mapped[str] = mapped_column(
        String(50),
        primary_key=True,
        nullable=False,
    )

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id"),
        primary_key=True,
        nullable=False,
        index=True,
    )

    # ---------------------------------------------------------
    # Current pending action
    # ---------------------------------------------------------
    pending_action: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # ---------------------------------------------------------
    # Existing appointment, if conversation is linked to one
    # ---------------------------------------------------------
    appointment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id"),
        nullable=True,
        index=True,
    )

    # ---------------------------------------------------------
    # BookingLink created from n8n conversation
    # ---------------------------------------------------------
    booking_link_id: Mapped[str | None] = mapped_column(
        String(255),
        ForeignKey("booking_links.id"),
        nullable=True,
        index=True,
    )

    # ---------------------------------------------------------
    # Timestamps
    # ---------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )