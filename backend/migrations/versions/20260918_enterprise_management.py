"""Add enterprise management fields.

Revision ID: 20260918_enterprise_management
Revises: 20260918_email_verified_at
"""
from alembic import op
import sqlalchemy as sa

revision = "20260918_enterprise_management"
down_revision = "20260918_email_verified_at"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("hospitals", sa.Column("business_type", sa.String(100), nullable=False, server_default="Healthcare"))
    op.add_column("hospitals", sa.Column("address", sa.String(500), nullable=True))
    op.add_column("hospitals", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade():
    op.drop_column("hospitals", "is_active")
    op.drop_column("hospitals", "address")
    op.drop_column("hospitals", "business_type")
