from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_user, require_roles
from app.db.database import get_db
from app.models.risk import Risk
from app.models.user import User
from app.schemas.risk import RiskCreate, RiskRead, RiskUpdate

risks_router = APIRouter()


@risks_router.get("", response_model=list[RiskRead])
def list_risks(
    project_id: int | None = Query(default=None),
    severity: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Risk)
    if project_id is not None:
        query = query.filter(Risk.project_id == project_id)
    if severity:
        query = query.filter(Risk.severity == severity.upper())
    if status:
        query = query.filter(Risk.status == status.upper())
    risks = query.order_by(Risk.created_at.desc()).all()
    return [RiskRead.model_validate(risk) for risk in risks]


@risks_router.get("/{risk_id}", response_model=RiskRead)
def get_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    return RiskRead.model_validate(risk)


@risks_router.post("", response_model=RiskRead, status_code=status.HTTP_201_CREATED)
def create_risk(
    risk_in: RiskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER", "ENGINEER")),
):
    risk = Risk(**risk_in.model_dump())
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return RiskRead.model_validate(risk)


@risks_router.put("/{risk_id}", response_model=RiskRead)
def update_risk(
    risk_id: int,
    risk_in: RiskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")

    for field, value in risk_in.model_dump(exclude_unset=True).items():
        setattr(risk, field, value)

    db.commit()
    db.refresh(risk)
    return RiskRead.model_validate(risk)


@risks_router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk(
    risk_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER")),
):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk not found")
    db.delete(risk)
    db.commit()
    return None
