from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Dependency(Base):
    __tablename__ = "dependencies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    source_task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=False)
    target_task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id"), nullable=False)
    dependency_type: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="OPEN", nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    source_task: Mapped[Task] = relationship("Task", foreign_keys=[source_task_id], backref="outgoing_dependencies")
    target_task: Mapped[Task] = relationship("Task", foreign_keys=[target_task_id], backref="incoming_dependencies")
    project: Mapped[Project] = relationship("Project", backref="dependencies", lazy="joined")
