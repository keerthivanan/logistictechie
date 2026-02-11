from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app import crud
from typing import Dict

router = APIRouter()

@router.get("/stats/{user_id}", response_model=Dict)
async def get_dashboard_stats(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns real-time dashboard statistics for the "Best of All Time" UI.
    """
    try:
        stats = await crud.booking.get_dashboard_stats(db, user_id=user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")
