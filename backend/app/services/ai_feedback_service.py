from __future__ import annotations

import json

from openai import AsyncOpenAI

from app.core.config import settings
from app.models.resume import ImproveResumeResponse


class AIFeedbackService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def improve_resume(
        self,
        resume_text: str,
        job_description_text: str | None = None,
    ) -> ImproveResumeResponse:
        if self.client is None:
            raise RuntimeError("OpenAI API key is not configured.")

        # Keep the contract narrow so the frontend can render feedback predictably.
        system_prompt = (
            "You are an elite resume reviewer and ATS consultant. "
            "Review the resume with a hiring-manager lens. "
            "Return only valid JSON with exactly these keys: "
            "strengths, weaknesses, improvement_suggestions. "
            "Each value must be an array of concise, actionable bullet-style strings. "
            "Keep feedback specific, candid, and professional."
        )

        user_prompt = (
            "Analyze the following resume and identify what is strong, weak, and how to improve it.\n\n"
            f"Resume:\n{resume_text}\n\n"
        )
        if job_description_text:
            user_prompt += (
                "Use this job description to tailor the recommendations and ATS optimization advice.\n\n"
                f"Job Description:\n{job_description_text}\n"
            )

        response = await self.client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = response.choices[0].message.content or "{}"
        payload = json.loads(content)
        return ImproveResumeResponse.model_validate(payload)
