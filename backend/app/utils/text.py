from __future__ import annotations

import re
from collections import OrderedDict

from app.utils.constants import DEGREE_HINTS, SECTION_ALIASES, SKILL_CATALOG


def normalize_text(text: str) -> str:
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    compacted = "\n".join(line for line in lines if line)
    return compacted.strip()


def normalize_heading(text: str) -> str:
    return re.sub(r"[^a-zA-Z ]", "", text).strip().lower()


def find_email(text: str) -> str | None:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else None


def find_phone(text: str) -> str | None:
    match = re.search(r"(\+?\d[\d\s().-]{8,}\d)", text)
    return match.group(0).strip() if match else None


def extract_sections(text: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {
        "skills": [],
        "education": [],
        "experience": [],
    }
    current_section: str | None = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        normalized_line = normalize_heading(line)
        matched_section = next(
            (
                section_name
                for section_name, aliases in SECTION_ALIASES.items()
                if normalized_line in aliases
            ),
            None,
        )
        if matched_section:
            current_section = matched_section
            continue

        if current_section in sections:
            sections[current_section].append(line)

    return sections


def deduplicate_preserve_order(items: list[str]) -> list[str]:
    return list(OrderedDict.fromkeys(item for item in items if item))


def extract_skills(text: str) -> list[str]:
    lowered_text = text.lower()
    detected_skills: list[str] = []

    for skill in SKILL_CATALOG:
        pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"
        if re.search(pattern, lowered_text):
            detected_skills.append(skill)

    return deduplicate_preserve_order(detected_skills)


def extract_education(section_lines: list[str], full_text: str) -> list[str]:
    candidates = [
        line
        for line in section_lines
        if any(hint in line.lower() for hint in DEGREE_HINTS) and len(line) >= 8
    ]

    if candidates:
        return deduplicate_preserve_order(candidates)[:5]

    fallback = [
        line.strip()
        for line in full_text.splitlines()
        if any(hint in line.lower() for hint in DEGREE_HINTS) and len(line.strip()) >= 8
    ]
    return deduplicate_preserve_order(fallback)[:5]


def extract_experience(section_lines: list[str], full_text: str) -> list[str]:
    patterns = (
        r"\b(19|20)\d{2}\b",
        r"\b(months?|years?)\b",
        r"\b(intern|engineer|developer|manager|analyst|lead|consultant)\b",
    )

    candidates = [
        line
        for line in section_lines
        if len(line) >= 15 and any(re.search(pattern, line.lower()) for pattern in patterns)
    ]

    if candidates:
        return deduplicate_preserve_order(candidates)[:6]

    fallback = [
        line.strip()
        for line in full_text.splitlines()
        if len(line.strip()) >= 20 and any(re.search(pattern, line.lower()) for pattern in patterns)
    ]
    return deduplicate_preserve_order(fallback)[:6]
