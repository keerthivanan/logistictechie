"""
Logistics AI Backend - Tracking Router
"""
from fastapi import APIRouter, HTTPException, Query

from app.schemas import TrackingResponse
from app.services.freight_engine import get_freight_engine

router = APIRouter(prefix="/api/tracking", tags=["Tracking"])


@router.get("/{container_id}", response_model=TrackingResponse)
async def track_container(container_id: str):
    """
    Track a container by its ID.
    
    - **container_id**: Container number (e.g., "MSCU1234567")
    
    Returns tracking events and current status.
    """
    if len(container_id) < 4:
        raise HTTPException(
            status_code=400, 
            detail="Container ID must be at least 4 characters"
        )
    
    try:
        service = get_freight_engine()
        response = await service.track_container(container_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def track_container_query(
    id: str = Query(..., min_length=4, description="Container ID to track")
):
    """
    Track a container using query parameter.
    Alternative endpoint for GET /api/tracking?id=XXXX
    """
    service = get_freight_engine()
    return await service.track_container(id)
