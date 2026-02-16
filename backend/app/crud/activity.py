from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.activity import UserActivity
from typing import List, Optional
from sqlalchemy import desc

class CRUDActivity:
    async def get_multi_by_user(
        self, db: AsyncSession, *, user_id: str, limit: int = 5
    ) -> List[UserActivity]:
        # Fetch latest activities by user_id
        result = await db.execute(
            select(UserActivity)
            .filter(UserActivity.user_id == user_id)
            .order_by(desc(UserActivity.created_at))
            .limit(limit)
        )
        return result.scalars().all()

activity = CRUDActivity()
