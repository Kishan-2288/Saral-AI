import hashlib
import secrets
import uuid

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.email_verification import EmailVerification
from app.services.email_service import send_verification_email


# ============================================================
# HASH TOKEN
# ============================================================

def _hash_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


# ============================================================
# ISSUE VERIFICATION
# ============================================================

def issue_verification(
    db: Session,
    user_id: uuid.UUID,
    user_type: str,
    email: str,
    name: str,
) -> None:

    print("\n==========================================")
    print("STARTING EMAIL VERIFICATION")
    print("==========================================")
    print("User ID   :", user_id)
    print("User Type :", user_type)
    print("Name      :", name)
    print("Email     :", repr(email))

    # --------------------------------------------------------
    # Invalidate previous unused tokens
    # --------------------------------------------------------

    db.query(EmailVerification).filter(
        EmailVerification.user_id == user_id,
        EmailVerification.user_type == user_type,
        EmailVerification.used_at.is_(None),
    ).update(
        {
            EmailVerification.used_at:
                datetime.now(timezone.utc)
        },
        synchronize_session=False,
    )

    # --------------------------------------------------------
    # Generate secure token
    # --------------------------------------------------------

    raw_token = secrets.token_urlsafe(48)

    # --------------------------------------------------------
    # Hash token before storing it
    # --------------------------------------------------------

    token_hash = _hash_token(raw_token)

    # --------------------------------------------------------
    # Expiry
    # --------------------------------------------------------

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS
        )
    )

    # --------------------------------------------------------
    # Create database verification record
    # --------------------------------------------------------

    verification = EmailVerification(
        user_id=user_id,
        user_type=user_type,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(verification)

    # Make sure verification record gets an ID
    db.flush()

    # --------------------------------------------------------
    # Create verification URL
    # --------------------------------------------------------

    frontend_url = (
        settings.RECEPTIONIST_FRONTEND_URL
        if user_type == "staff"
        else settings.ADMIN_FRONTEND_URL
    ).rstrip("/")

    verification_url = (
        f"{frontend_url}"
        f"/verify-email?token={raw_token}"
    )

    print("Verification URL:")
    print(verification_url)
    print("Expires at:", expires_at)

    # --------------------------------------------------------
    # Send email
    # --------------------------------------------------------

    try:

        print("Sending verification email...")

        send_verification_email(
            email,
            name,
            verification_url,
        )

        print("✅ Verification email sent successfully")

    except Exception as exc:

        print("❌ Verification email failed")
        print("Error:", repr(exc))

        raise

    print("==========================================")
    print("VERIFICATION COMPLETE")
    print("==========================================\n")


# ============================================================
# TOKEN HASH
# ============================================================

def token_hash(token: str) -> str:
    return _hash_token(token)