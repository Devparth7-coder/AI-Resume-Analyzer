from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.database import get_database
from app.dependencies.auth import get_current_user
from app.models.auth import UserPublic
from app.models.resume import (
    ImproveResumeRequest,
    ImproveResumeResponse,
    JobMatchRequest,
    JobMatchResponse,
    ResumeAnalysisResponse,
)
from app.services.ai_feedback_service import AIFeedbackService
from app.services.job_match_service import JobMatchService
from app.services.resume_service import ResumeService
from app.utils.pdf import extract_text_from_pdf

router = APIRouter(tags=["Resume Intelligence"])


@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: UserPublic = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database),
) -> ResumeAnalysisResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resumes are supported.",
        )

    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds {settings.max_upload_size_mb} MB.",
        )

    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF could not be parsed.",
        ) from exc

    if len(resume_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The extracted resume text is too short to analyze.",
        )

    service = ResumeService(database)
    return await service.analyze_and_store(
        user_id=current_user.id,
        filename=file.filename,
        resume_text=resume_text,
    )


@router.post("/match-resume", response_model=JobMatchResponse)
async def match_resume(
    payload: JobMatchRequest,
    _: UserPublic = Depends(get_current_user),
) -> JobMatchResponse:
    service = JobMatchService()
    return service.match_resume(
        resume_text=payload.resume_text,
        job_description_text=payload.job_description_text,
    )


@router.post("/improve-resume", response_model=ImproveResumeResponse)
async def improve_resume(
    payload: ImproveResumeRequest,
    _: UserPublic = Depends(get_current_user),
) -> ImproveResumeResponse:
    service = AIFeedbackService()
    try:
        return await service.improve_resume(
            resume_text=payload.resume_text,
            job_description_text=payload.job_description_text,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
