from __future__ import annotations

import re
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.dashboard import AnalysisHistoryItem, DashboardOverviewResponse, ScoreHistoryPoint
from app.models.resume import ResumeAnalysisResponse, ResumeExtractedData
from app.utils.text import (
    extract_education,
    extract_experience,
    extract_sections,
    extract_skills,
    find_email,
    find_phone,
)


class ResumeService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["resume_analyses"]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("user_id", 1), ("created_at", -1)])

    async def analyze_and_store(self, user_id: str, filename: str, resume_text: str) -> ResumeAnalysisResponse:
        sections = extract_sections(resume_text)
        skills = extract_skills(resume_text)
        education = extract_education(sections["education"], resume_text)
        experience = extract_experience(sections["experience"], resume_text)
        extracted_data = ResumeExtractedData(
            skills=skills,
            education=education,
            experience=experience,
        )
        ats_score = self._calculate_ats_score(resume_text, extracted_data)
        suggestions = self._build_suggestions(resume_text, extracted_data)
        now = datetime.now(timezone.utc)

        document = {
            "user_id": user_id,
            "filename": filename,
            "resume_text": resume_text,
            "detected_skills": skills,
            "education": education,
            "experience": experience,
            "ats_score": ats_score,
            "suggestions": suggestions,
            "created_at": now,
            "updated_at": now,
        }

        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return self._serialize_analysis(document)

    async def get_history(self, user_id: str, limit: int = 20) -> list[AnalysisHistoryItem]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        documents = await cursor.to_list(length=limit)
        return [self._serialize_history_item(document) for document in documents]

    async def get_overview(self, user_id: str) -> DashboardOverviewResponse:
        history = await self.get_history(user_id=user_id, limit=12)
        total_uploads = await self.collection.count_documents({"user_id": user_id})
        if not history:
            return DashboardOverviewResponse(
                total_uploads=0,
                average_ats_score=0,
                latest_score=None,
                score_history=[],
                recent_analyses=[],
            )

        aggregates = await self.collection.aggregate(
            [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "average_ats_score": {"$avg": "$ats_score"}}},
            ]
        ).to_list(length=1)
        average_score = round(aggregates[0]["average_ats_score"], 1) if aggregates else 0
        score_history = [
            ScoreHistoryPoint(
                label=item.filename[:18],
                score=item.ats_score,
                created_at=item.created_at,
            )
            for item in reversed(history)
        ]
        return DashboardOverviewResponse(
            total_uploads=total_uploads,
            average_ats_score=average_score,
            latest_score=history[0].ats_score,
            score_history=score_history,
            recent_analyses=history[:5],
        )

    def _calculate_ats_score(self, resume_text: str, extracted_data: ResumeExtractedData) -> int:
        words = resume_text.split()
        word_count = len(words)

        score = 0.0
        if find_email(resume_text):
            score += 8
        if find_phone(resume_text):
            score += 7

        # The ATS score blends contact completeness, section coverage, skills density,
        # quantified impact, and resume length into a practical 0-100 heuristic.
        completed_sections = sum(
            bool(section)
            for section in (
                extracted_data.skills,
                extracted_data.education,
                extracted_data.experience,
            )
        )
        score += (completed_sections / 3) * 25
        score += min(len(extracted_data.skills), 12) / 12 * 25

        impact_lines = sum(
            1
            for line in extracted_data.experience
            if re.search(r"(\d+%|\$\d+|\b\d+\+?\b)", line)
        )
        if extracted_data.experience:
            score += 8
        score += min(impact_lines, 4) / 4 * 12

        if 350 <= word_count <= 900:
            score += 15
        elif 250 <= word_count < 350 or 900 < word_count <= 1100:
            score += 10
        elif 180 <= word_count < 250:
            score += 5

        return max(0, min(100, round(score)))

    def _build_suggestions(
        self,
        resume_text: str,
        extracted_data: ResumeExtractedData,
    ) -> list[str]:
        suggestions: list[str] = []
        word_count = len(resume_text.split())

        if not find_email(resume_text) or not find_phone(resume_text):
            suggestions.append("Add both a professional email address and phone number near the top.")
        if len(extracted_data.skills) < 8:
            suggestions.append("Expand the skills section with role-specific tools, frameworks, and platforms.")
        if not extracted_data.education:
            suggestions.append("Include a clear education section so ATS systems can classify your background.")
        if not extracted_data.experience:
            suggestions.append("Strengthen the experience section with titles, dates, and measurable responsibilities.")
        if extracted_data.experience and not any(
            re.search(r"(\d+%|\$\d+|\b\d+\+?\b)", line) for line in extracted_data.experience
        ):
            suggestions.append("Add quantified achievements to work experience, such as percentages, revenue, or scale.")
        if word_count < 300:
            suggestions.append("The resume is short for most roles; add stronger project and achievement detail.")
        if word_count > 1100:
            suggestions.append("Trim older or lower-impact content so recruiters can scan the resume faster.")

        if not suggestions:
            suggestions.append("Tailor the top summary and skills list for each job description to improve ATS fit.")

        return suggestions[:5]

    def _serialize_analysis(self, document: dict) -> ResumeAnalysisResponse:
        return ResumeAnalysisResponse(
            analysis_id=str(document["_id"]),
            filename=document["filename"],
            ats_score=document["ats_score"],
            detected_skills=document["detected_skills"],
            suggestions=document["suggestions"],
            extracted_data=ResumeExtractedData(
                skills=document["detected_skills"],
                education=document["education"],
                experience=document["experience"],
            ),
            resume_text=document["resume_text"],
            created_at=document["created_at"],
        )

    def _serialize_history_item(self, document: dict) -> AnalysisHistoryItem:
        document_id = document.get("_id")
        if isinstance(document_id, ObjectId):
            document_id = str(document_id)

        return AnalysisHistoryItem(
            id=document_id,
            filename=document["filename"],
            ats_score=document["ats_score"],
            detected_skills=document.get("detected_skills", []),
            suggestions=document.get("suggestions", []),
            created_at=document["created_at"],
            resume_text=document.get("resume_text", ""),
        )
