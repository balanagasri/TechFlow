from datetime import date

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    status: str = "TODO"
    priority: str = "MEDIUM"
    story_points: int | None = None
    start_date: date | None = None
    due_date: date | None = None
    assignee_id: int | None = None
    reporter_id: int | None = None


class TaskCreate(TaskBase):
    project_id: int


class TaskUpdate(TaskBase):
    pass


class TaskRead(TaskBase):
    id: int
    project_id: int
    completed_at: str | None = None
    created_at: str | None = None
    updated_at: str | None = None

    model_config = {"from_attributes": True}
