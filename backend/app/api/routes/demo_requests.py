from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.demo_request import DemoRequest
from app.schemas.demo_request import DemoRequestCreate

router = APIRouter()


@router.post("/")
def create_demo_request(
    payload: DemoRequestCreate,
    db: Session = Depends(get_db),
):
    lead = DemoRequest(
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        phone=payload.phone.strip(),
        organization=payload.organization.strip(),
        industry=payload.industry.strip(),
        monthly_conversations=payload.monthly_conversations.strip(),
        primary_challenge=payload.primary_challenge.strip(),
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return {"success": True, "leadId": lead.id}
