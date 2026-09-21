"""Add admin, receptionist, and patient report portal tables.

Revision ID: 20260918_portal_access
Revises: 20260914_booking_payment_mvp
"""
from alembic import op
import sqlalchemy as sa

revision = "20260918_portal_access"
down_revision = "20260914_booking_payment_mvp"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "admins",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_admins_email", "admins", ["email"])

    op.create_table(
        "staff",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("role", sa.String(40), nullable=False, server_default="receptionist"),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_staff_hospital_id", "staff", ["hospital_id"])
    op.create_index("ix_staff_email", "staff", ["email"])

    op.create_table(
        "patient_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_url", sa.String(1000), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_patient_reports_hospital_id", "patient_reports", ["hospital_id"])
    op.create_index("ix_patient_reports_patient_id", "patient_reports", ["patient_id"])


def downgrade():
    op.drop_index("ix_patient_reports_patient_id", table_name="patient_reports")
    op.drop_index("ix_patient_reports_hospital_id", table_name="patient_reports")
    op.drop_table("patient_reports")
    op.drop_index("ix_staff_email", table_name="staff")
    op.drop_index("ix_staff_hospital_id", table_name="staff")
    op.drop_table("staff")
    op.drop_index("ix_admins_email", table_name="admins")
    op.drop_table("admins")
