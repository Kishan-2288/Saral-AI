from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class IntentRequest(BaseModel):
    message: str

class IntentResponse(BaseModel):
    intent: str
    confidence: float

@router.post("/intent", response_model=IntentResponse)
def detect_intent(payload: IntentRequest):
    text = payload.message.lower()
    if any(x in text for x in ["book", "appointment", "doctor"]):
        return IntentResponse(intent="appointment", confidence=0.90)
    if any(x in text for x in ["cancel", "cancellation"]):
        return IntentResponse(intent="cancel_appointment", confidence=0.90)
    if any(x in text for x in ["reschedule", "change appointment"]):
        return IntentResponse(intent="reschedule_appointment", confidence=0.90)
    if any(x in text for x in ["payment", "pay", "fee"]):
        return IntentResponse(intent="payment", confidence=0.85)
    return IntentResponse(intent="faq_or_handoff", confidence=0.55)
