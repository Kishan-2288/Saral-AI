"""Add Saral AI booking and payment MVP tables/columns.

Revision ID: 20260914_booking_payment_mvp
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "20260914_booking_payment_mvp"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # New booking tables.
    op.create_table(
        "departments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_departments_hospital_id", "departments", ["hospital_id"])

    op.create_table(
        "doctor_schedules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("doctor_id", sa.String(36), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("slot_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_doctor_schedules_doctor_id", "doctor_schedules", ["doctor_id"])

    op.create_table(
        "booking_links",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("source", sa.String(30), nullable=False, server_default="web"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_booking_links_token", "booking_links", ["token"])
    op.create_index("ix_booking_links_hospital_id", "booking_links", ["hospital_id"])

    # Existing MVP doctor table needs these booking fields.
    op.add_column("doctors", sa.Column("department_id", sa.String(36), nullable=True))
    op.add_column("doctors", sa.Column("consultation_fee", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.create_index("ix_doctors_department_id", "doctors", ["department_id"])
    op.create_foreign_key(
        "fk_doctors_department_id",
        "doctors",
        "departments",
        ["department_id"],
        ["id"],
    )


def downgrade():
    op.drop_constraint("fk_doctors_department_id", "doctors", type_="foreignkey")
    op.drop_index("ix_doctors_department_id", table_name="doctors")
    op.drop_column("doctors", "consultation_fee")
    op.drop_column("doctors", "department_id")

    op.drop_index("ix_booking_links_hospital_id", table_name="booking_links")
    op.drop_index("ix_booking_links_token", table_name="booking_links")
    op.drop_table("booking_links")

    op.drop_index("ix_doctor_schedules_doctor_id", table_name="doctor_schedules")
    op.drop_table("doctor_schedules")

    op.drop_index("ix_departments_hospital_id", table_name="departments")
    op.drop_table("departments")
