from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import get_database, mongo_manager
from app.routers import auth, dashboard, health, resume
from app.services.auth_service import AuthService
from app.services.resume_service import ResumeService


@asynccontextmanager
async def lifespan(_: FastAPI):
    database = await get_database()
    await AuthService(database).ensure_indexes()
    await ResumeService(database).ensure_indexes()
    yield
    await mongo_manager.close()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "AI Resume Analyzer API is running."}


app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(resume.router, prefix=settings.api_v1_prefix)
app.include_router(dashboard.router, prefix=settings.api_v1_prefix)
