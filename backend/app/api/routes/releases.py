from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_user, require_roles
from app.db.database import get_db
from app.models.release import Release
from app.models.user import User
from app.schemas.release import ReleaseCreate, ReleaseRead, ReleaseUpdate

releases_router = APIRouter()


@releases_router.get("", response_model=list[ReleaseRead])
def list_releases(
    project_id: int | None = Query(default=None),
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Release)
    if project_id is not None:
        query = query.filter(Release.project_id == project_id)
    if status:
        query = query.filter(Release.status == status.upper())
    releases = query.order_by(Release.planned_date.is_(None), Release.planned_date.asc()).all()
    return [ReleaseRead.model_validate(release) for release in releases]


@releases_router.get("/{release_id}", response_model=ReleaseRead)
def get_release(
    release_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    release = db.query(Release).filter(Release.id == release_id).first()
    if not release:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Release not found")
    return ReleaseRead.model_validate(release)


@releases_router.post("", response_model=ReleaseRead, status_code=status.HTTP_201_CREATED)
def create_release(
    release_in: ReleaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    release = Release(**release_in.model_dump())
    db.add(release)
    db.commit()
    db.refresh(release)
    return ReleaseRead.model_validate(release)


@releases_router.put("/{release_id}", response_model=ReleaseRead)
def update_release(
    release_id: int,
    release_in: ReleaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    release = db.query(Release).filter(Release.id == release_id).first()
    if not release:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Release not found")

    for field, value in release_in.model_dump(exclude_unset=True).items():
        setattr(release, field, value)

    db.commit()
    db.refresh(release)
    return ReleaseRead.model_validate(release)


@releases_router.delete("/{release_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_release(
    release_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    release = db.query(Release).filter(Release.id == release_id).first()
    if not release:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Release not found")
    db.delete(release)
    db.commit()
    return None
