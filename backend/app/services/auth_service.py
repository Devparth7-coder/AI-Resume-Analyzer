from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.auth import TokenResponse, UserCreate, UserPublic


class AuthService:
    def __init__(self, database: AsyncIOMotorDatabase) -> None:
        self.collection = database["users"]

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("email", unique=True)

    async def create_user(self, payload: UserCreate) -> TokenResponse:
        existing_user = await self.collection.find_one({"email": payload.email.lower()})
        if existing_user:
            raise ValueError("A user with that email already exists.")

        now = datetime.now(timezone.utc)
        document = {
            "full_name": payload.full_name,
            "email": payload.email.lower(),
            "password_hash": get_password_hash(payload.password),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(document)
        user = UserPublic(
            id=str(result.inserted_id),
            full_name=document["full_name"],
            email=document["email"],
            created_at=document["created_at"],
        )
        return TokenResponse(access_token=create_access_token(user.id), user=user)

    async def authenticate_user(self, email: str, password: str) -> TokenResponse | None:
        user = await self.collection.find_one({"email": email.lower()})
        if not user or not verify_password(password, user["password_hash"]):
            return None

        public_user = UserPublic(
            id=str(user["_id"]),
            full_name=user["full_name"],
            email=user["email"],
            created_at=user["created_at"],
        )
        return TokenResponse(
            access_token=create_access_token(public_user.id),
            user=public_user,
        )

    async def get_user_by_id(self, user_id: str) -> UserPublic | None:
        if not ObjectId.is_valid(user_id):
            return None

        user = await self.collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None

        return UserPublic(
            id=str(user["_id"]),
            full_name=user["full_name"],
            email=user["email"],
            created_at=user["created_at"],
        )
