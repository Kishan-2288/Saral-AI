"""Send a replacement verification email for an existing administrator."""

import psycopg

from create_admin import DATABASE_URL, FRONTEND_URL, create_verification_token
from app.services.email_service import send_verification_email


def main() -> None:
    email = input("Existing admin email: ").strip().lower()
    if not email:
        raise ValueError("Email cannot be empty.")

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, email_verified FROM admins WHERE email = %s",
                (email,),
            )
            admin = cur.fetchone()
            if not admin:
                raise ValueError(f"No admin exists with email '{email}'.")
            if admin[3]:
                raise ValueError("This admin's email is already verified.")
            token = create_verification_token(cur, admin[0])

    verification_url = f"{FRONTEND_URL.rstrip('/')}/verify-email?token={token}"
    send_verification_email(admin[2], admin[1], verification_url)
    print(f"Verification email sent to {admin[2]}.")


if __name__ == "__main__":
    main()
