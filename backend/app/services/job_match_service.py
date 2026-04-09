from __future__ import annotations

import re
from collections import Counter

from app.models.resume import JobMatchResponse
from app.utils.constants import SKILL_CATALOG, STOP_WORDS
from app.utils.text import deduplicate_preserve_order, normalize_text


class JobMatchService:
    def match_resume(self, resume_text: str, job_description_text: str) -> JobMatchResponse:
        job_keywords = self._extract_keywords(job_description_text)
        if not job_keywords:
            return JobMatchResponse(match_score=0, matched_keywords=[], missing_keywords=[])

        resume_corpus = normalize_text(resume_text).lower()
        matched_keywords = [
            keyword
            for keyword in job_keywords
            if re.search(r"(?<!\w)" + re.escape(keyword.lower()) + r"(?!\w)", resume_corpus)
        ]
        missing_keywords = [keyword for keyword in job_keywords if keyword not in matched_keywords]
        match_score = round((len(matched_keywords) / len(job_keywords)) * 100)

        return JobMatchResponse(
            match_score=match_score,
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
        )

    def _extract_keywords(self, text: str, limit: int = 20) -> list[str]:
        normalized_text = normalize_text(text).lower()
        detected_skills = [
            skill
            for skill in SKILL_CATALOG
            if re.search(r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)", normalized_text)
        ]

        words = re.findall(r"[a-zA-Z][a-zA-Z0-9.+#/-]{2,}", normalized_text)
        frequency = Counter(
            word
            for word in words
            if word not in STOP_WORDS and not word.isdigit() and len(word) > 2
        )
        general_keywords = [word.title() for word, _ in frequency.most_common(limit)]

        combined = deduplicate_preserve_order(detected_skills + general_keywords)
        return combined[:limit]
