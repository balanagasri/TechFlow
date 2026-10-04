from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.db.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

dashboard_router = APIRouter()


@dashboard_router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).all()
    tasks = db.query(Task).all()
    return {
        "total_projects": len(projects),
        "active_projects": sum(1 for p in projects if p.status in {"IN_PROGRESS", "AT_RISK", "BLOCKED"}),
        "at_risk_projects": sum(1 for p in projects if p.status == "AT_RISK"),
        "blocked_projects": sum(1 for p in projects if p.status == "BLOCKED"),
        "completed_projects": sum(1 for p in projects if p.status == "COMPLETED"),
        "open_tasks": sum(1 for t in tasks if t.status != "DONE"),
        "completed_tasks": sum(1 for t in tasks if t.status == "DONE"),
    }
