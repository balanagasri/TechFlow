from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Blocker(Base):
    __tablename__ = "blockers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="OPEN", nullable=False, index=True)
    identified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    target_resolution_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped[Project] = relationship("Project", backref="blockers", lazy="joined")
    owner: Mapped[User | None] = relationship("User", foreign_keys=[owner_id], lazy="joined")
    task: Mapped[Task | None] = relationship("Task", backref="blockers", lazy="joined")
