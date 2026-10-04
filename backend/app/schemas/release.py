from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class ReleaseBase(BaseModel):
    project_id: int
    version: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    planned_date: date | None = None
    actual_date: date | None = None
    status: str = "PLANNED"
    release_owner_id: int | None = None
    environment: str = "DEV"


class ReleaseCreate(ReleaseBase):
    pass


class ReleaseUpdate(ReleaseBase):
    pass


class ReleaseRead(ReleaseBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
