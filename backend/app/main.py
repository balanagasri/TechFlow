from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import Base, engine
from app.models import *  # noqa: F401,F403
from app.api.routes.auth import auth_router
from app.api.routes.projects import projects_router
from app.api.routes.tasks import tasks_router
from app.api.routes.dashboard import dashboard_router
from app.api.routes.risks import risks_router
from app.api.routes.releases import releases_router
from app.api.routes.search import search_router
from app.api.routes.notifications import notifications_router
from app.seed import seed

settings = get_settings()
app = FastAPI(title="TechFlow", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(risks_router, prefix="/api/risks", tags=["risks"])
app.include_router(releases_router, prefix="/api/releases", tags=["releases"])
app.include_router(search_router, prefix="/api", tags=["search"])
app.include_router(notifications_router, prefix="/api", tags=["notifications"])


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "app": settings.app_name}


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    seed()
