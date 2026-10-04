from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.db.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

search_router = APIRouter()


@search_router.get("/search")
def search_entities(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = db.query(Project).filter(Project.name.ilike(f"%{q}%")).limit(5).all()
    tasks = db.query(Task).filter(Task.title.ilike(f"%{q}%")).limit(5).all()
    return {
        "projects": [
            {"id": project.id, "name": project.name, "type": "project", "url": f"/projects/{project.id}"} for project in projects
        ],
        "tasks": [{"id": task.id, "name": task.title, "type": "task", "url": f"/tasks/{task.id}"} for task in tasks],
    }
