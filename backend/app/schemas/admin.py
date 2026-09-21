from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class EnterpriseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    phone: str | None = None
    email: EmailStr | None = None
    organization_name: str | None = None
    business_type: str = "Healthcare"
    address: str | None = None
    receptionist_name: str | None = Field(default=None, min_length=2, max_length=200)
    receptionist_email: EmailStr | None = None
    temporary_password: str | None = Field(default=None, min_length=8)


class EnterpriseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    phone: str | None = None
    email: EmailStr | None = None
    business_type: str | None = None
    address: str | None = None
    is_active: bool | None = None


class StaffCreate(BaseModel):
    hospital_id: str
    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    role: str = "receptionist"
    temporary_password: str | None = Field(default=None, min_length=8)


class StaffUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    email: EmailStr | None = None
    role: str | None = None
    hospital_id: str | None = None
    is_active: bool | None = None
    temporary_password: str | None = Field(default=None, min_length=8)


class StaffRead(BaseModel):
    id: str
    hospital_id: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    email_verified: bool
    enterprise_name: str
    created_at: datetime


class ReportCreate(BaseModel):
    patient_id: str
    file_name: str = Field(min_length=1, max_length=255)
    file_url: str | None = None
    notes: str | None = None
