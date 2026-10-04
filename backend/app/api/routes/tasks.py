from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_user, require_roles
from app.db.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate

tasks_router = APIRouter()


@tasks_router.get("", response_model=list[TaskRead])
def list_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    return [TaskRead.model_validate(task) for task in tasks]


@tasks_router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskRead.model_validate(task)


@tasks_router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER", "ENGINEER"))):
    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskRead.model_validate(task)


@tasks_router.put("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    if task.status == "DONE" and task.completed_at is None:
        task.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    db.commit()
    db.refresh(task)
    return TaskRead.model_validate(task)


@tasks_router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_roles("ADMIN", "PROGRAM_MANAGER"))):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
    return None
