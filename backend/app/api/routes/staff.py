from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.security import hash_password
from app.db.session import get_db

from app.models.hospital import Hospital
from app.models.staff import Staff

from app.schemas.admin import (
    StaffCreate,
    StaffRead,
    StaffUpdate,
)

from app.services.verification_service import (
    issue_verification,
)

import secrets
import string


router = APIRouter()


# ============================================================
# TEMPORARY PASSWORD
# ============================================================

def temporary_password(length: int = 12) -> str:

    characters = (
        string.ascii_letters
        + string.digits
    )

    return "".join(
        secrets.choice(characters)
        for _ in range(length)
    )


# ============================================================
# LIST STAFF
# ============================================================

@router.get(
    "/",
    response_model=list[StaffRead]
)
def list_staff(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):

    staff_members = db.scalars(
        select(Staff)
        .order_by(
            Staff.created_at.desc()
        )
    ).all()

    result = []

    for staff in staff_members:

        hospital = db.get(
            Hospital,
            staff.hospital_id
        )

        result.append(
            {
                "id": str(staff.id),

                "hospital_id": str(
                    staff.hospital_id
                ),

                "full_name": staff.name,

                "email": staff.email,

                "role": staff.role,

                "is_active": staff.is_active,

                "email_verified":
                    staff.email_verified,

                "enterprise_name": (
                    hospital.name
                    if hospital
                    else "Unknown Enterprise"
                ),

                "created_at":
                    staff.created_at,
            }
        )

    return result


# ============================================================
# CREATE STAFF
# ============================================================

@router.post(
    "/",
    response_model=StaffRead,
    status_code=201
)
def create_staff(
    payload: StaffCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):

    # --------------------------------------------------------
    # Find enterprise
    # --------------------------------------------------------

    hospital = db.get(
        Hospital,
        payload.hospital_id
    )

    if not hospital:

        raise HTTPException(
            status_code=404,
            detail="Enterprise not found"
        )

    # --------------------------------------------------------
    # Enterprise must be active
    # --------------------------------------------------------

    if hospital.status != "active":

        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot create staff for "
                "an inactive enterprise"
            )
        )

    # --------------------------------------------------------
    # Check duplicate email
    # --------------------------------------------------------

    existing_staff = db.scalar(
        select(Staff).where(
            Staff.email == payload.email
        )
    )

    if existing_staff:

        raise HTTPException(
            status_code=409,
            detail=(
                "A staff account already "
                "uses this email"
            )
        )

    # --------------------------------------------------------
    # Generate password
    # --------------------------------------------------------

    password = (
        payload.temporary_password
        if payload.temporary_password
        else temporary_password()
    )

    # --------------------------------------------------------
    # Create Staff
    # --------------------------------------------------------

    staff = Staff(
        hospital_id=hospital.id,

        name=payload.full_name,

        email=payload.email,

        role=payload.role,

        password_hash=hash_password(
            password
        ),

        is_active=True,

        email_verified=False,
    )

    db.add(staff)

    # --------------------------------------------------------
    # Generate UUID
    # --------------------------------------------------------

    db.flush()

    print("\n==========================================")
    print("CREATING RECEPTIONIST")
    print("==========================================")
    print("Staff ID :", staff.id)
    print("Name     :", staff.name)
    print("Email    :", repr(staff.email))
    print("Hospital :", hospital.name)
    print("Role     :", staff.role)
    print("==========================================")

    # --------------------------------------------------------
    # Send verification email
    # --------------------------------------------------------

    try:

        issue_verification(
            db=db,

            user_id=staff.id,

            user_type="staff",

            email=staff.email,

            name=staff.name,
        )

        print(
            "✅ Receptionist verification "
            "email process completed"
        )

    except Exception as exc:

        print(
            "❌ Receptionist verification "
            "email failed:",
            repr(exc)
        )

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Receptionist account was not created "
                "because the verification email "
                f"could not be sent: {str(exc)}"
            )
        )

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    db.refresh(staff)

    print("✅ Receptionist created successfully")
    print("==========================================\n")

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "id": str(staff.id),

        "hospital_id": str(
            staff.hospital_id
        ),

        "full_name": staff.name,

        "email": staff.email,

        "role": staff.role,

        "is_active": staff.is_active,

        "email_verified":
            staff.email_verified,

        "enterprise_name":
            hospital.name,

        "created_at":
            staff.created_at,
    }


# ============================================================
# UPDATE STAFF
# ============================================================

@router.patch(
    "/{staff_id}",
    response_model=StaffRead
)
def update_staff(
    staff_id: str,
    payload: StaffUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):

    staff = db.get(
        Staff,
        staff_id
    )

    if not staff:

        raise HTTPException(
            status_code=404,
            detail="Staff member not found"
        )

    data = payload.model_dump(
        exclude_unset=True
    )

    # --------------------------------------------------------
    # Update fields
    # --------------------------------------------------------

    for key, value in data.items():

        # ----------------------------------------------------
        # Name
        # ----------------------------------------------------

        if key == "full_name":

            staff.name = value

        # ----------------------------------------------------
        # Password
        # ----------------------------------------------------

        elif key == "temporary_password":

            if value:

                staff.password_hash = (
                    hash_password(value)
                )

        # ----------------------------------------------------
        # Enterprise
        # ----------------------------------------------------

        elif key == "hospital_id":

            hospital = db.get(
                Hospital,
                value
            )

            if not hospital:

                raise HTTPException(
                    status_code=404,
                    detail="Enterprise not found"
                )

            if hospital.status != "active":

                staff.is_active = False

            staff.hospital_id = hospital.id

        # ----------------------------------------------------
        # Email
        # ----------------------------------------------------

        elif key == "email":

            existing_staff = db.scalar(
                select(Staff).where(
                    Staff.email == value,
                    Staff.id != staff.id
                )
            )

            if existing_staff:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Another staff account "
                        "already uses this email"
                    )
                )

            staff.email = value

        # ----------------------------------------------------
        # Active / inactive
        # ----------------------------------------------------

        elif key == "is_active":

            if value:

                hospital = db.get(
                    Hospital,
                    staff.hospital_id
                )

                if not hospital:

                    raise HTTPException(
                        status_code=404,
                        detail="Enterprise not found"
                    )

                if hospital.status != "active":

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Cannot activate staff "
                            "because the enterprise "
                            "is inactive"
                        )
                    )

            staff.is_active = value

        # ----------------------------------------------------
        # Other fields
        # ----------------------------------------------------

        else:

            setattr(
                staff,
                key,
                value
            )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    db.commit()

    db.refresh(staff)

    # --------------------------------------------------------
    # Get enterprise
    # --------------------------------------------------------

    hospital = db.get(
        Hospital,
        staff.hospital_id
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "id": str(staff.id),

        "hospital_id": str(
            staff.hospital_id
        ),

        "full_name": staff.name,

        "email": staff.email,

        "role": staff.role,

        "is_active": staff.is_active,

        "email_verified":
            staff.email_verified,

        "enterprise_name": (
            hospital.name
            if hospital
            else "Unknown Enterprise"
        ),

        "created_at":
            staff.created_at,
    }


@router.delete("/{staff_id}")
def delete_staff(
    staff_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    staff = db.get(Staff, staff_id)

    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    staff_name = staff.name
    db.delete(staff)
    db.commit()

    return {
        "message": "Staff deleted successfully",
        "id": staff_id,
        "name": staff_name,
    }