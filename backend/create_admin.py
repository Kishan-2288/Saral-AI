"""Create an administrator and email its one-time verification link."""

import getpass
import hashlib
import os
import secrets
import uuid
from datetime import datetime, timedelta

import bcrypt
import psycopg
from dotenv import load_dotenv

from app.services.email_service import send_verification_email

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
FRONTEND_URL = os.getenv("ADMIN_FRONTEND_URL") or os.getenv("FRONTEND_URL", "http://localhost:5173")
TOKEN_EXPIRY_HOURS = int(os.getenv("VERIFICATION_TOKEN_EXPIRE_HOURS", "24"))

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")

DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://").replace(
    "postgresql+psycopg2://", "postgresql://"
)


def create_verification_token(cur, admin_id: str) -> str:
    """Invalidate old links and persist only a digest of the new token."""
    cur.execute(
        """
        UPDATE email_verifications
        SET used_at = %s
        WHERE user_id = %s AND user_type = 'admin' AND used_at IS NULL
        """,
        (datetime.utcnow(), admin_id),
    )
    token = secrets.token_urlsafe(48)
    cur.execute(
        """
        INSERT INTO email_verifications (id, user_id, user_type, token_hash, expires_at, created_at)
        VALUES (%s, %s, 'admin', %s, %s, %s)
        """,
        (
            str(uuid.uuid4()),
            admin_id,
            hashlib.sha256(token.encode("utf-8")).hexdigest(),
            datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
            datetime.utcnow(),
        ),
    )
    return token


def main() -> None:
    print("\n=== Saral AI - Create Administrator ===\n")
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if not name or not email:
        raise ValueError("Name and email cannot be empty.")
    if password != confirm_password:
        raise ValueError("Passwords do not match.")
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM admins WHERE email = %s", (email,))
            if cur.fetchone():
                raise ValueError(f"An admin with email '{email}' already exists.")
            cur.execute(
                """
                INSERT INTO admins (name, email, password_hash, is_active, email_verified)
                VALUES (%s, %s, %s, TRUE, FALSE)
                RETURNING id
                """,
                (name, email, password_hash),
            )
            admin_id = cur.fetchone()[0]
            token = create_verification_token(cur, admin_id)

    verification_url = f"{FRONTEND_URL.rstrip('/')}/verify-email?token={token}"
    send_verification_email(email, name, verification_url)
    print(f"\nAdmin created. A verification link was sent to {email}.")


if __name__ == "__main__":
    main()
