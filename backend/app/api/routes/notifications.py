from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User

notifications_router = APIRouter()


@notifications_router.get("/notifications")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": item.id,
            "type": item.type,
            "title": item.title,
            "message": item.message,
            "is_read": item.is_read,
            "created_at": item.created_at.isoformat(),
        }
        for item in notifications
    ]
