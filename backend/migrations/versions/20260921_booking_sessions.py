"""Add booking sessions for n8n-to-payment booking flow.

Revision ID: 20260921_booking_sessions
Revises: 20260918_enterprise_management
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260921_booking_sessions"
down_revision = "20260918_enterprise_management"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "booking_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("token", sa.String(96), nullable=False, unique=True),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("doctor_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("department_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("appointment_date", sa.Date(), nullable=False),
        sa.Column("appointment_time", sa.Time(), nullable=False),
        sa.Column("patient_name", sa.String(200), nullable=False),
        sa.Column("patient_phone", sa.String(30), nullable=False),
        sa.Column("patient_email", sa.String(255), nullable=True),
        sa.Column("reason_for_visit", sa.Text(), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_booking_sessions_token", "booking_sessions", ["token"], unique=True)
    op.create_index("ix_booking_sessions_hospital_id", "booking_sessions", ["hospital_id"])
    op.create_index("ix_booking_sessions_doctor_id", "booking_sessions", ["doctor_id"])
    op.create_index("ix_booking_sessions_patient_id", "booking_sessions", ["patient_id"])
    op.add_column("payments", sa.Column("booking_session_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key("fk_payments_booking_session_id", "payments", "booking_sessions", ["booking_session_id"], ["id"])
    op.create_index("ix_payments_booking_session_id", "payments", ["booking_session_id"])


def downgrade():
    op.drop_index("ix_payments_booking_session_id", table_name="payments")
    op.drop_constraint("fk_payments_booking_session_id", "payments", type_="foreignkey")
    op.drop_column("payments", "booking_session_id")
    op.drop_index("ix_booking_sessions_patient_id", table_name="booking_sessions")
    op.drop_index("ix_booking_sessions_doctor_id", table_name="booking_sessions")
    op.drop_index("ix_booking_sessions_hospital_id", table_name="booking_sessions")
    op.drop_index("ix_booking_sessions_token", table_name="booking_sessions")
    op.drop_table("booking_sessions")