from datetime import date

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    key: str = Field(..., min_length=2, max_length=30)
    description: str | None = None
    status: str = "PLANNING"
    priority: str = "MEDIUM"
    start_date: date | None = None
    target_date: date | None = None


class ProjectCreate(ProjectBase):
    owner_id: int | None = None


class ProjectUpdate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int
    owner_id: int | None = None
    created_at: str | None = None
    updated_at: str | None = None

    model_config = {"from_attributes": True}
