from pydantic import BaseModel, EmailStr, Field


class DemoRequestCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=30)
    organization: str = Field(min_length=2, max_length=120)
    industry: str = Field(min_length=1, max_length=60)
    monthly_conversations: str = Field(min_length=1, max_length=40)
    primary_challenge: str = Field(default="", max_length=1000)
