from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.auth.security import get_current_user, require_roles
from app.db.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate

projects_router = APIRouter()


@projects_router.get("", response_model=list[ProjectRead])
def list_projects(
    status: str | None = None,
    priority: str | None = None,
    owner: int | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    if priority:
        query = query.filter(Project.priority == priority)
    if owner:
        query = query.filter(Project.owner_id == owner)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%"))
    projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    return [ProjectRead.model_validate(project) for project in projects]


@projects_router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ProjectRead.model_validate(project)


@projects_router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    if project_in.key:
        existing = db.query(Project).filter(Project.key == project_in.key.upper()).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project key already exists")

    project = Project(
        name=project_in.name,
        key=project_in.key.upper(),
        description=project_in.description,
        owner_id=project_in.owner_id or current_user.id,
        status=project_in.status,
        priority=project_in.priority,
        start_date=project_in.start_date,
        target_date=project_in.target_date,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectRead.model_validate(project)


@projects_router.put("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    project.key = project.key.upper()
    db.commit()
    db.refresh(project)
    return ProjectRead.model_validate(project)


@projects_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
