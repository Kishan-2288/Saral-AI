from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.db.session import get_db

from app.models.admin import Admin
from app.models.hospital import Hospital
from app.models.staff import Staff
from app.models.email_verification import EmailVerification

from app.schemas.auth import (
    LoginRequest,
    SetPasswordRequest,
    TokenResponse,
    UserRead,
    VerificationTokenRequest,
    VerificationEmailRequest,
)

from app.services.verification_service import (
    issue_verification,
    token_hash,
)


router = APIRouter()


# ============================================================
# HELPERS
# ============================================================

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================
# LOGIN
# ============================================================

@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Check admin first
    # --------------------------------------------------------

    account = db.scalar(
        select(Admin).where(
            Admin.email == payload.email
        )
    )

    role = "admin"

    # --------------------------------------------------------
    # If not admin, check staff
    # --------------------------------------------------------

    if not account:
        account = db.scalar(
            select(Staff).where(
                Staff.email == payload.email
            )
        )

        if account:
            role = account.role

    # --------------------------------------------------------
    # Validate account and password
    # --------------------------------------------------------

    if not account:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not account.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account is inactive",
        )

    if not verify_password(
        payload.password,
        account.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # Email verification
    # --------------------------------------------------------

    if not account.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in",
        )

    # --------------------------------------------------------
    # Staff enterprise check
    # --------------------------------------------------------

    if role != "admin":

        hospital = db.get(
            Hospital,
            account.hospital_id,
        )

        if not hospital:
            raise HTTPException(
                status_code=401,
                detail="Enterprise not found",
            )

        if hospital.status != "active":
            raise HTTPException(
                status_code=401,
                detail="Your enterprise is inactive",
            )

    # --------------------------------------------------------
    # Hospital ID
    # --------------------------------------------------------

    hospital_id = getattr(account, "hospital_id", None)

    if hospital_id is not None:
        hospital_id = str(hospital_id)

    user = UserRead(
        id=str(account.id),
        email=account.email,
        full_name=account.full_name,
        role=role,
        hospital_id=hospital_id,
    )

    # --------------------------------------------------------
    # JWT
    # --------------------------------------------------------

    return TokenResponse(
        access_token=create_access_token(
            account.id,
            role,
            hospital_id,
        ),
        user=user,
    )


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find verification token
    # --------------------------------------------------------

    verification = db.scalar(
        select(EmailVerification).where(
            EmailVerification.token_hash
            == token_hash(token),
            EmailVerification.used_at.is_(None),
        )
    )

    now = utc_now()

    # --------------------------------------------------------
    # Validate token
    # --------------------------------------------------------

    if (
        not verification
        or verification.expires_at <= now
        or verification.user_type not in {
            "admin",
            "staff",
        }
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification link",
        )

    # --------------------------------------------------------
    # Find account
    # --------------------------------------------------------

    account_model = (
        Admin
        if verification.user_type == "admin"
        else Staff
    )

    account = db.get(
        account_model,
        verification.user_id,
    )

    if not account:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification link",
        )

    # ========================================================
    # ADMIN VERIFICATION
    # ========================================================

    if verification.user_type == "admin":

        # ----------------------------------------------------
        # Consume token atomically
        # ----------------------------------------------------

        consumed = db.execute(
            update(EmailVerification)
            .where(
                EmailVerification.id
                == verification.id,

                EmailVerification.used_at
                .is_(None),
            )
            .values(
                used_at=now,
            )
        )

        if consumed.rowcount != 1:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired verification link",
            )

        # ----------------------------------------------------
        # Mark admin email as verified
        # ----------------------------------------------------

        account.email_verified = True
        account.email_verified_at = now

        db.commit()

        return {
            "message": "Email verified successfully",
            "requires_password": False,
            "user_type": "admin",
            "redirect_to": "/login",
        }

    # ========================================================
    # STAFF / RECEPTIONIST VERIFICATION
    # ========================================================

    if verification.user_type == "staff":

        staff = account

        # ----------------------------------------------------
        # Consume token atomically
        # ----------------------------------------------------

        consumed = db.execute(
            update(EmailVerification)
            .where(
                EmailVerification.id
                == verification.id,

                EmailVerification.used_at
                .is_(None),
            )
            .values(
                used_at=now,
            )
        )

        if consumed.rowcount != 1:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired verification link",
            )

        # ----------------------------------------------------
        # IMPORTANT:
        # Mark receptionist email as verified
        # ----------------------------------------------------

        staff.email_verified = True
        staff.email_verified_at = now

        db.commit()

        return {
            "message": "Email verified successfully",
            "requires_password": False,
            "user_type": "staff",
            "redirect_to": "/login",
        }

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    raise HTTPException(
        status_code=400,
        detail="Invalid verification account type",
    )


# ============================================================
# VERIFY EMAIL FROM RECEPTIONIST PORTAL
# ============================================================

@router.post("/verify-email")
def verify_email_from_portal(
    payload: VerificationTokenRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find token
    # --------------------------------------------------------

    verification = db.scalar(
        select(EmailVerification).where(
            EmailVerification.token_hash
            == token_hash(payload.token),

            EmailVerification.used_at.is_(None),
        )
    )

    now = utc_now()

    # --------------------------------------------------------
    # Validate token
    # --------------------------------------------------------

    if (
        not verification
        or verification.expires_at <= now
        or verification.user_type
        not in {"admin", "staff"}
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification link",
        )

    # --------------------------------------------------------
    # Find account
    # --------------------------------------------------------

    account_model = (
        Admin
        if verification.user_type == "admin"
        else Staff
    )

    account = db.get(
        account_model,
        verification.user_id,
    )

    if not account:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification link",
        )

    # --------------------------------------------------------
    # Consume token atomically
    # --------------------------------------------------------

    consumed = db.execute(
        update(EmailVerification)
        .where(
            EmailVerification.id
            == verification.id,

            EmailVerification.used_at
            .is_(None),
        )
        .values(
            used_at=now,
        )
    )

    if consumed.rowcount != 1:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification link",
        )

    # --------------------------------------------------------
    # Mark account verified
    # --------------------------------------------------------

    account.email_verified = True
    account.email_verified_at = now

    db.commit()

    return {
        "message": "Email verified successfully",
        "requires_password": False,
        "user_type": verification.user_type,
        "redirect_to": "/login",
    }


# ============================================================
# SET STAFF PASSWORD
# ============================================================

@router.post("/set-password")
def set_password(
    payload: SetPasswordRequest,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Find verification record
    # --------------------------------------------------------

    verification = db.scalar(
        select(EmailVerification).where(
            EmailVerification.token_hash
            == token_hash(payload.token),

            EmailVerification.user_type
            == "staff",
        )
    )

    now = utc_now()

    # --------------------------------------------------------
    # Validate token
    # --------------------------------------------------------

    if (
        not verification
        or verification.expires_at <= now
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired activation link",
        )

    # --------------------------------------------------------
    # Find staff
    # --------------------------------------------------------

    staff = db.get(
        Staff,
        verification.user_id,
    )

    if not staff:
        raise HTTPException(
            status_code=400,
            detail="Invalid activation link",
        )

    # --------------------------------------------------------
    # Set password
    # --------------------------------------------------------

    staff.password_hash = hash_password(
        payload.password
    )

    # --------------------------------------------------------
    # Verify email
    # --------------------------------------------------------

    staff.email_verified = True
    staff.email_verified_at = now

    # --------------------------------------------------------
    # Consume token if not already consumed
    # --------------------------------------------------------

    if verification.used_at is None:

        verification.used_at = now

    db.commit()

    return {
        "message": "Account activated successfully"
    }


# ============================================================
# RESEND VERIFICATION EMAIL
# ============================================================

@router.post("/resend-verification")
def resend_verification(
    payload: VerificationEmailRequest,
    db: Session = Depends(get_db),
):
    """
    Always return a generic response so that an attacker
    cannot determine whether an email is registered.
    """

    # --------------------------------------------------------
    # Check admin
    # --------------------------------------------------------

    account = db.scalar(
        select(Admin).where(
            Admin.email == payload.email
        )
    )

    user_type = "admin"

    # --------------------------------------------------------
    # Check staff
    # --------------------------------------------------------

    if not account:

        account = db.scalar(
            select(Staff).where(
                Staff.email == payload.email
            )
        )

        user_type = "staff"

    # --------------------------------------------------------
    # Send verification email
    # --------------------------------------------------------

    if (
        account
        and account.is_active
        and not account.email_verified
    ):

        recent_cutoff = (
            utc_now()
            - timedelta(minutes=1)
        )

        recent = db.scalar(
            select(EmailVerification).where(
                EmailVerification.user_id
                == account.id,

                EmailVerification.user_type
                == user_type,

                EmailVerification.created_at
                >= recent_cutoff,

                EmailVerification.used_at
                .is_(None),
            )
        )

        # ----------------------------------------------------
        # Rate limit
        # ----------------------------------------------------

        if not recent:

            issue_verification(
                db=db,
                user_id=account.id,
                user_type=user_type,
                email=account.email,
                name=account.name,
            )

            db.commit()

    return {
        "message": (
            "If an active account exists, "
            "a verification email will be sent shortly"
        )
    }