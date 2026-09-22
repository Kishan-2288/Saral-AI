from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.security import hash_password
from app.db.session import get_db

from app.models.hospital import Hospital
from app.models.staff import Staff
from app.models.appointment import Appointment

from app.schemas.admin import EnterpriseCreate, EnterpriseUpdate
from app.services.verification_service import issue_verification


router = APIRouter()


# ============================================================
# LIST ENTERPRISES
# ============================================================

@router.get("/")
def list_enterprises(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    hospitals = db.scalars(
        select(Hospital)
        .order_by(Hospital.created_at.desc())
    ).all()

    result = []

    for hospital in hospitals:

        staff_count = db.scalar(
            select(func.count())
            .select_from(Staff)
            .where(
                Staff.hospital_id == hospital.id
            )
        ) or 0

        result.append({
            "id": str(hospital.id),
            "name": hospital.name,
            "phone": hospital.phone,
            "email": hospital.email,
            "address": hospital.address,
            "status": hospital.status,
            "is_active": hospital.status == "active",
            "created_at": hospital.created_at,
            "staff_count": staff_count,
        })

    return result


# ============================================================
# CREATE ENTERPRISE
# ============================================================

@router.post("/", status_code=201)
def create_enterprise(
    payload: EnterpriseCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    # --------------------------------------------------------
    # Check duplicate hospital email
    # --------------------------------------------------------

    if payload.email:

        existing = db.scalar(
            select(Hospital).where(
                Hospital.email == payload.email
            )
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="An enterprise with this email already exists",
            )

    # --------------------------------------------------------
    # Create hospital
    # --------------------------------------------------------

    hospital = Hospital(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        status="active",
    )

    db.add(hospital)

    # Generate hospital UUID
    db.flush()

    # --------------------------------------------------------
    # Create receptionist
    # --------------------------------------------------------

    if (
        payload.receptionist_name
        and payload.receptionist_email
        and payload.temporary_password
    ):

        existing_staff = db.scalar(
            select(Staff).where(
                Staff.email == payload.receptionist_email
            )
        )

        if existing_staff:
            raise HTTPException(
                status_code=409,
                detail="A staff account already uses this email",
            )

        # IMPORTANT:
        # Staff table uses `name`, NOT `full_name`
        staff = Staff(
            hospital_id=hospital.id,
            name=payload.receptionist_name,
            email=payload.receptionist_email,
            role="receptionist",
            password_hash=hash_password(
                payload.temporary_password
            ),
            is_active=True,
            email_verified=False,
        )

        db.add(staff)

        # Generate staff UUID
        db.flush()

        # ----------------------------------------------------
        # Send verification email
        # ----------------------------------------------------

        issue_verification(
            db=db,
            user_id=staff.id,
            user_type="staff",
            email=staff.email,
            name=staff.name,
        )

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    db.refresh(hospital)

    return {
        "id": str(hospital.id),
        "name": hospital.name,
        "phone": hospital.phone,
        "email": hospital.email,
        "address": hospital.address,
        "status": hospital.status,
        "is_active": hospital.status == "active",
    }


# ============================================================
# UPDATE ENTERPRISE
# ============================================================

@router.patch("/{hospital_id}")
def update_enterprise(
    hospital_id: str,
    payload: EnterpriseUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    # --------------------------------------------------------
    # Get enterprise
    # --------------------------------------------------------

    hospital = db.get(Hospital, hospital_id)

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Enterprise not found",
        )

    # --------------------------------------------------------
    # Get fields sent by frontend
    # --------------------------------------------------------

    data = payload.model_dump(
        exclude_unset=True
    )

    # ========================================================
    # ENTERPRISE STATUS
    # ========================================================

    if "is_active" in data:

        is_active = data["is_active"]

        hospital.status = (
            "active"
            if is_active
            else "inactive"
        )

        # If enterprise becomes inactive,
        # deactivate all staff belonging to it.
        if not is_active:

            db.query(Staff).filter(
                Staff.hospital_id == hospital.id
            ).update(
                {
                    Staff.is_active: False
                },
                synchronize_session=False,
            )

    # ========================================================
    # UPDATE OTHER ENTERPRISE FIELDS
    # ========================================================

    for key, value in data.items():

        if key == "is_active":
            continue

        # business_type does not exist in current DB
        if key == "business_type":
            continue

        # Only allow fields that actually exist
        # on the Hospital model.
        if key in {
            "name",
            "phone",
            "email",
            "address",
            "razorpay_account_id",
            "status",
            "wa_phone_number_id",
        }:
            setattr(
                hospital,
                key,
                value,
            )

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    db.refresh(hospital)

    return {
        "id": str(hospital.id),
        "name": hospital.name,
        "phone": hospital.phone,
        "email": hospital.email,
        "address": hospital.address,
        "status": hospital.status,
        "is_active": hospital.status == "active",
    }


# ============================================================
# ENTERPRISE DETAILS
# ============================================================

@router.get("/{hospital_id}")
def enterprise_detail(
    hospital_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    # --------------------------------------------------------
    # Get hospital
    # --------------------------------------------------------

    hospital = db.get(
        Hospital,
        hospital_id
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Enterprise not found",
        )

    # --------------------------------------------------------
    # Get staff
    # --------------------------------------------------------

    staff = db.scalars(
        select(Staff)
        .where(
            Staff.hospital_id == hospital.id
        )
        .order_by(
            Staff.created_at.desc()
        )
    ).all()

    # --------------------------------------------------------
    # Patient count
    #
    # patients table does not have hospital_id.
    # Count unique patients through appointments.
    # --------------------------------------------------------

    patient_count = db.scalar(
        select(
            func.count(
                func.distinct(
                    Appointment.patient_id
                )
            )
        )
        .select_from(Appointment)
        .where(
            Appointment.hospital_id == hospital.id,
            Appointment.patient_id.is_not(None),
        )
    ) or 0

    # --------------------------------------------------------
    # Appointment count
    # --------------------------------------------------------

    appointment_count = db.scalar(
        select(
            func.count()
        )
        .select_from(Appointment)
        .where(
            Appointment.hospital_id == hospital.id
        )
    ) or 0

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "id": str(hospital.id),

        "name": hospital.name,

        "phone": hospital.phone,

        "email": hospital.email,

        "address": hospital.address,

        "status": hospital.status,

        "is_active": hospital.status == "active",

        "staff_count": len(staff),

        "patient_count": patient_count,

        "appointment_count": appointment_count,

        "staff": [
            {
                "id": str(member.id),

                # Actual DB/model field
                "name": member.name,

                # Keep this for compatibility with
                # an older frontend if necessary.
                "full_name": member.name,

                "email": member.email,

                "role": member.role,

                "is_active": member.is_active,

                "email_verified": member.email_verified,
            }
            for member in staff
        ],
    }


# ============================================================
# DELETE ENTERPRISE
# ============================================================

@router.delete("/{hospital_id}")
def delete_enterprise(
    hospital_id: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    hospital = db.get(
        Hospital,
        hospital_id
    )

    if not hospital:
        raise HTTPException(
            status_code=404,
            detail="Enterprise not found",
        )

    enterprise_name = hospital.name

    db.delete(hospital)

    db.commit()

    return {
        "message": "Enterprise deleted successfully",
        "id": hospital_id,
        "name": enterprise_name,
    }