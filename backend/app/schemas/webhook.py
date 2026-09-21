from typing import Any
from pydantic import BaseModel, Field

class WebhookPayload(BaseModel):
    event: str = "unknown"
    data: dict[str, Any] = Field(default_factory=dict)
