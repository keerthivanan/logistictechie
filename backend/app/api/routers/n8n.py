from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel
from typing import Any
from app.db.session import get_db
from app.models.marketplace import MarketplaceRequest
from app.api.deps import verify_n8n_webhook

router = APIRouter()

class QuotationNewMock(BaseModel):
    request_id: str
    quotation_id: str
    forwarder_company: str
    price: float
    currency: str
    transit_days: int
    summary: str
    user_id: str

@router.post("/quotations/new", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_quotations_new(data: QuotationNewMock):
    """
    Catches the exact API call from WF2.
    The actual DB insert happened via /api/marketplace/n8n-sync previously in the workflow.
    """
    return {"success": True, "message": "Quotation acknowledged and verified."}

class N8nStatusUpdate(BaseModel):
    request_id: str
    status: str
    closed_at: str = ""
    closed_reason: str = ""
    quotations: list = []

@router.post("/requests/close", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_requests_close(sync_in: N8nStatusUpdate, db: AsyncSession = Depends(get_db)):
    """
    Catches the exact API call from WF3.
    """
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == sync_in.request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail=f"Request {sync_in.request_id} not found.")
        
    req.status = sync_in.status
    if sync_in.status == "CLOSED":
        req.closed_at = datetime.utcnow()
        req.closed_reason = sync_in.closed_reason
        
    await db.commit()
    return {"success": True, "message": f"Status updated to {sync_in.status} by n8n"}
