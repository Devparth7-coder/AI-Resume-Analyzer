from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.dependencies.auth import get_current_user
from app.models.auth import UserPublic
from app.models.dashboard import AnalysisHistoryItem, DashboardOverviewResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    current_user: UserPublic = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> DashboardOverviewResponse:
    service = ResumeService(database)
    return await service.get_overview(current_user.id)


@router.get("/history", response_model=list[AnalysisHistoryItem])
async def get_dashboard_history(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: UserPublic = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> list[AnalysisHistoryItem]:
    service = ResumeService(database)
    return await service.get_history(current_user.id, limit=limit)
