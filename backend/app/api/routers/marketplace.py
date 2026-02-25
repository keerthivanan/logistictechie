from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.forwarder import Forwarder
from sqlalchemy import select, func
from datetime import datetime
import uuid, asyncio
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.webhook import webhook_service
from app.api.deps import verify_n8n_webhook

router = APIRouter()

class MarketplaceSubmit(BaseModel):
    user_id: str
    sovereign_id: str = ""
    user_name: str = "Client"
    user_email: str = ""
    origin: str
    destination: str
    cargo_type: str
    weight_kg: float
    dimensions: str = ""
    special_requirements: str = ""
    incoterms: str = "FOB"
    currency: str = "USD"

def _fire_webhook(payload: dict):
    """Fire-and-forget webhook in a background thread."""
    asyncio.run(webhook_service.trigger_marketplace_webhook(payload))

@router.post("/submit")
async def submit_request(
    request_in: MarketplaceSubmit,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    User submits a cargo quotation request.
    Saves to PostgreSQL and fires webhook to n8n Cloud (non-blocking).
    Request ID format: OMEGO-0009-REQ-01
    """
    sid = request_in.sovereign_id or "OMEGO-0000"
    
    # Count THIS user's requests (per-user sequential counter)
    user_count = await db.execute(
        select(func.count()).select_from(MarketplaceRequest)
        .where(MarketplaceRequest.user_sovereign_id == sid)
    )
    seq = (user_count.scalar() or 0) + 1
    request_id = f"{sid}-REQ-{str(seq).zfill(2)}"
    
    new_request = MarketplaceRequest(
        request_id=request_id,
        user_sovereign_id=sid,
        user_email=request_in.user_email,
        user_name=request_in.user_name,
        origin=request_in.origin,
        destination=request_in.destination,
        cargo_type=request_in.cargo_type,
        weight_kg=request_in.weight_kg,
        dimensions=request_in.dimensions,
        special_requirements=request_in.special_requirements,
        incoterms=request_in.incoterms,
        currency=request_in.currency,
        status="OPEN",
        quotation_count=0
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Fire webhook to n8n Cloud (non-blocking)
    background_tasks.add_task(_fire_webhook, {
        "request_id": request_id,
        "user_sovereign_id": sid,
        "user_name": request_in.user_name,
        "user_email": request_in.user_email,
        "origin": request_in.origin,
        "destination": request_in.destination,
        "cargo_type": request_in.cargo_type,
        "weight_kg": request_in.weight_kg,
        "dimensions": request_in.dimensions,
        "special_requirements": request_in.special_requirements,
        "incoterms": request_in.incoterms,
        "currency": request_in.currency
    })
    
    return {"success": True, "uniqueId": request_id, "request_id": request_id}

@router.get("/quotes/{request_id}")
async def get_marketplace_quotes(request_id: str, db: AsyncSession = Depends(get_db)):
    """
    Frontend polls this every 5 seconds to get live quotes.
    """
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    bid_stmt = select(MarketplaceBid).where(
        MarketplaceBid.request_id == request_id
    ).order_by(MarketplaceBid.created_at.asc())
    bid_result = await db.execute(bid_stmt)
    bids = bid_result.scalars().all()
    
    formatted_quotes = []
    for b in bids:
        formatted_quotes.append({
            "id": b.id,
            "quotation_id": b.quotation_id,
            "forwarder_id": b.forwarder_id,
            "company_name": b.forwarder_company,
            "price": b.total_price,
            "currency": b.currency,
            "transit_days": b.transit_days,
            "validity_days": b.validity_days,
            "carrier": b.carrier,
            "service_type": b.service_type,
            "surcharges": b.surcharges,
            "payment_terms": b.payment_terms,
            "notes": b.notes,
            "ai_summary": b.ai_summary,
            "status": b.status
        })
        
    return {
        "request_id": request_id,
        "status": req.status,
        "quotation_count": req.quotation_count,
        "quotes": formatted_quotes
    }

class N8nStatusUpdate(BaseModel):
    request_id: str
    status: str
    closed_at: str = ""
    closed_reason: str = ""
    quotations: list = []

@router.post("/close", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_requests_close(sync_in: N8nStatusUpdate, db: AsyncSession = Depends(get_db)):
    """
    Webhook for n8n (WF3) to change the status of a request to CLOSED.
    Matches the exact payload of the WF3 HTTP Request Node.
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
    WF2 calls this node after calling n8n-sync.
    We simply acknowledge the receipt to prevent n8n from failing,
    as the data was already inserted into the PostgreSQL db via n8n-sync.
    """
    return {"success": True, "message": "Quotation acknowledged and verified."}

class N8nQuoteSync(BaseModel):
    quotation_id: str
    request_id: str
    forwarder_id: str = ""
    forwarder_company: str
    total_price: float
    currency: str = "USD"
    transit_days: int = 0
    validity_days: int = 7
    carrier: str = ""
    service_type: str = ""
    surcharges: Any = None
    payment_terms: str = ""
    notes: str = ""
    ai_summary: str = ""
    raw_email: str = ""

@router.post("/n8n-sync", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_quote_sync(sync_in: N8nQuoteSync, db: AsyncSession = Depends(get_db)):
    """
    Dedicated highly-secure webhook for n8n to push AI-extracted quotes directly into the Sovereign Database (Postgres).
    Matches QUOTATIONS format.
    """
    # 1. Verify the Request exists
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == sync_in.request_id).with_for_update()
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail=f"Request {sync_in.request_id} not found in Sovereign Database.")

    if req.status == "CLOSED":
        return {"success": False, "message": "Backend: Request already explicitly CLOSED by n8n."}

    # 2. Increment the quote count accurately
    req.quotation_count += 1
    position = req.quotation_count

    # 3. Insert the MarketplaceBid
    new_bid = MarketplaceBid(
        quotation_id=sync_in.quotation_id,
        request_id=sync_in.request_id,
        forwarder_id=sync_in.forwarder_id,
        forwarder_company=sync_in.forwarder_company,
        total_price=sync_in.total_price,
        currency=sync_in.currency,
        transit_days=sync_in.transit_days,
        validity_days=sync_in.validity_days,
        carrier=sync_in.carrier,
        service_type=sync_in.service_type,
        surcharges=sync_in.surcharges,
        payment_terms=sync_in.payment_terms,
        notes=sync_in.notes,
        ai_summary=sync_in.ai_summary,
        raw_email=sync_in.raw_email,
        status="EVALUATING"
    )
    
    db.add(new_bid)
    await db.commit()
    
    return {
        "success": True,
        "message": "Quote successfully synced from n8n to Sovereign DB.",
        "quotation_count": position,
        "request_status": req.status
    }
