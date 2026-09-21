"""Add email verification for portal accounts.

Revision ID: 20260918_email_verification
Revises: 20260918_portal_access
"""
from alembic import op
import sqlalchemy as sa

revision = "20260918_email_verification"
down_revision = "20260918_portal_access"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("admins", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("staff", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_table(
        "email_verifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False),
        sa.Column("user_type", sa.String(20), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_email_verifications_token_hash", "email_verifications", ["token_hash"])
    op.create_index("ix_email_verifications_user", "email_verifications", ["user_id", "user_type"])


def downgrade():
    op.drop_index("ix_email_verifications_user", table_name="email_verifications")
    op.drop_index("ix_email_verifications_token_hash", table_name="email_verifications")
    op.drop_table("email_verifications")
    op.drop_column("staff", "email_verified")
    op.drop_column("admins", "email_verified")
