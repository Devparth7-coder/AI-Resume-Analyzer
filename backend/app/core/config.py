from __future__ import annotations

import json

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Resume Analyzer API"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(
        default="change-me-in-production",
        description="JWT signing key.",
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "ai_resume_analyzer"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    max_upload_size_mb: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if not value:
            return []
        parsed_value = value.strip()
        if parsed_value.startswith("["):
            return json.loads(parsed_value)
        return [origin.strip() for origin in parsed_value.split(",") if origin.strip()]


settings = Settings()
