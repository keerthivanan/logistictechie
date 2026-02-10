from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import UserActivity
from typing import Optional
import json

class ActivityService:
    """Service to log user activities for analytics and audit."""
    
    async def log(
        self,
        db: AsyncSession,
        action: str,
        user_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> UserActivity:
        """Log a user activity."""
        activity = UserActivity(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            user_agent=user_agent,
            extra_data=json.dumps(metadata) if metadata else None
        )
        db.add(activity)
        await db.commit()
        return activity

activity_service = ActivityService()
