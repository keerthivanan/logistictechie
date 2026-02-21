from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.activity import UserActivity
from typing import List, Optional
from sqlalchemy import desc

class CRUDActivity:
    async def get_multi_by_user(
        self, db: AsyncSession, *, user_id: str, limit: int = 5, offset: int = 0
    ) -> List[UserActivity]:
        # Fetch latest activities by user_id
        result = await db.execute(
            select(UserActivity)
            .filter(UserActivity.user_id == user_id)
            .order_by(desc(UserActivity.created_at))
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()

    async def create(
        self, 
        db: AsyncSession, 
        *, 
        user_id: str, 
        action: str, 
        entity_type: Optional[str] = None, 
        entity_id: Optional[str] = None, 
        extra_data: Optional[dict] = None
    ) -> UserActivity:
        import json
        db_obj = UserActivity(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            extra_data=json.dumps(extra_data) if extra_data else None
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

activity = CRUDActivity()
