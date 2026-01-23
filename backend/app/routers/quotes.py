"""
Logistics AI Backend - Quotes Router
"""
from fastapi import APIRouter, HTTPException

from app.schemas import QuoteRequest, QuoteResponse
from app.services.freight_engine import get_freight_engine

router = APIRouter(prefix="/api/quotes", tags=["Quotes"])


@router.post("/", response_model=QuoteResponse)
async def get_quotes(request: QuoteRequest):
    """
    Get shipping quotes for a route.
    Uses the Sovereign Logistics Engine (Autonomous or Connected).
    """
    try:
        service = get_freight_engine()
        response = await service.get_quotes(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demo")
async def get_demo_quotes():
    """
    Get demo quotes for testing purposes.
    """
    demo_request = QuoteRequest(
        origin="Shanghai, China",
        destination="Jeddah, Saudi Arabia",
        cargo_type="20ft"
    )
    
    service = get_freight_engine()
    return await service.get_quotes(demo_request)
