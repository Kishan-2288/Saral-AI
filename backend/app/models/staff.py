import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Staff(Base):
    __tablename__ = "staff"

    # ============================================================
    # ID
    # ============================================================

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # ============================================================
    # ENTERPRISE / HOSPITAL
    # ============================================================

    hospital_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hospitals.id"),
        index=True,
        nullable=False
    )

    # ============================================================
    # NAME
    # Database column = name
    # Application can use full_name
    # ============================================================

    name: Mapped[str] = mapped_column(
        "name",
        String(200),
        nullable=False
    )

    @property
    def full_name(self) -> str:
        return self.name

    @full_name.setter
    def full_name(self, value: str) -> None:
        self.name = value

    # ============================================================
    # EMAIL
    # ============================================================

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    # ============================================================
    # ROLE
    # ============================================================

    role: Mapped[str] = mapped_column(
        String(40),
        default="receptionist",
        nullable=False
    )

    # ============================================================
    # PASSWORD
    # ============================================================

    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # ============================================================
    # STATUS
    # ============================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # ============================================================
    # EMAIL VERIFICATION
    # ============================================================

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )