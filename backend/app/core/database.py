from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class MongoManager:
    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None
        self._database: AsyncIOMotorDatabase | None = None

    async def connect(self) -> AsyncIOMotorDatabase:
        if self._database is not None:
            return self._database

        self._client = AsyncIOMotorClient(settings.mongodb_uri)
        self._database = self._client[settings.mongodb_database]
        await self._client.admin.command("ping")
        return self._database

    async def close(self) -> None:
        if self._client is not None:
            self._client.close()
        self._client = None
        self._database = None


mongo_manager = MongoManager()


async def get_database() -> AsyncIOMotorDatabase:
    return await mongo_manager.connect()
