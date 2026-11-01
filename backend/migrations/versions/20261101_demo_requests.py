"""Create demo request leads table.

Revision ID: 20261101_demo_requests
"""

from alembic import op
import sqlalchemy as sa


revision = "20261101_demo_requests"
down_revision = "20260921_booking_sessions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "demo_requests",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("organization", sa.String(length=120), nullable=False),
        sa.Column("industry", sa.String(length=60), nullable=False),
        sa.Column("monthly_conversations", sa.String(length=40), nullable=False),
        sa.Column("primary_challenge", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_demo_requests_email", "demo_requests", ["email"])


def downgrade() -> None:
    op.drop_index("ix_demo_requests_email", table_name="demo_requests")
    op.drop_table("demo_requests")
