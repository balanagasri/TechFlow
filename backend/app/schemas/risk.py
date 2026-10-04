from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class RiskBase(BaseModel):
    project_id: int
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    category: str = Field(..., min_length=2, max_length=80)
    probability: int = Field(..., ge=1, le=5)
    impact: int = Field(..., ge=1, le=5)
    severity: str = "MEDIUM"
    owner_id: int | None = None
    mitigation_plan: str | None = None
    contingency_plan: str | None = None
    status: str = "OPEN"
    due_date: date | None = None


class RiskCreate(RiskBase):
    pass


class RiskUpdate(RiskBase):
    pass


class RiskRead(RiskBase):
    id: int
    identified_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
