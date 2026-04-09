from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ScoreHistoryPoint(BaseModel):
    label: str
    score: int
    created_at: datetime


class AnalysisHistoryItem(BaseModel):
    id: str
    filename: str
    ats_score: int
    detected_skills: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    created_at: datetime
    resume_text: str


class DashboardOverviewResponse(BaseModel):
    total_uploads: int
    average_ats_score: float
    latest_score: int | None = None
    score_history: list[ScoreHistoryPoint] = Field(default_factory=list)
    recent_analyses: list[AnalysisHistoryItem] = Field(default_factory=list)
