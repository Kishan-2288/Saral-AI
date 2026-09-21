"""Record when a portal account verified its email.

Revision ID: 20260918_email_verified_at
Revises: 20260918_email_verification
"""

from alembic import op
import sqlalchemy as sa


revision = "20260918_email_verified_at"
down_revision = "20260918_email_verification"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("admins", sa.Column("email_verified_at", sa.DateTime(), nullable=True))
    op.add_column("staff", sa.Column("email_verified_at", sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column("staff", "email_verified_at")
    op.drop_column("admins", "email_verified_at")
