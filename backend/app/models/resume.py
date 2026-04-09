from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ResumeExtractedData(BaseModel):
    skills: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    analysis_id: str
    filename: str
    ats_score: int
    detected_skills: list[str]
    suggestions: list[str]
    extracted_data: ResumeExtractedData
    resume_text: str
    created_at: datetime


class JobMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description_text: str = Field(..., min_length=50)


class JobMatchResponse(BaseModel):
    match_score: int
    matched_keywords: list[str]
    missing_keywords: list[str]


class ImproveResumeRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description_text: str | None = None


class ImproveResumeResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    improvement_suggestions: list[str]
