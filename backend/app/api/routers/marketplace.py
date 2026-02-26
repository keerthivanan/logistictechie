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
    name: str = "Client"
    email: str = ""
    phone: str = ""
    origin: str
    destination: str
    cargo_type: str
    weight: float
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
    db: AsyncSession = Depends(get_db)
):
    """
    User submits a cargo quotation request.
    Strict Master-Slave Protocol: 
    1. Fires webhook to n8n Cloud to generate the master Request ID.
    2. Awaits the master ID from n8n.
    3. Saves exactly that ID to PostgreSQL.
    """
    
    # 1. Prepare exact payload defined by COMPLETE_SETUP_GUIDE.md
    payload = {
        "user_id": request_in.user_id,
        "sovereign_id": request_in.sovereign_id,
        "name": request_in.name,
        "email": request_in.email,
        "phone": request_in.phone,
        "origin": request_in.origin,
        "destination": request_in.destination,
        "cargo_type": request_in.cargo_type,
        "weight": request_in.weight,
        "dimensions": request_in.dimensions,
        "special_requirements": request_in.special_requirements,
        "incoterms": request_in.incoterms,
        "currency": request_in.currency
    }

    # 2. Fire webhook synchronously to get the Master Data from n8n WF1
    n8n_response = await webhook_service.trigger_marketplace_webhook(payload)
    
    if not n8n_response or not n8n_response.get("request_id"):
        # Fallback pseudo-generation only if n8n is critically down
        sid = request_in.sovereign_id or "OMEGO-0000"
        user_count = await db.execute(select(func.count()).select_from(MarketplaceRequest).where(MarketplaceRequest.user_sovereign_id == sid))
        seq = (user_count.scalar() or 0) + 1
        request_id = f"{sid}-REQ-{str(seq).zfill(2)}"
    else:
        request_id = n8n_response.get("request_id")
        
    sid = request_id.split('-REQ-')[0] if '-REQ-' in request_id else (request_in.sovereign_id or "OMEGO-0000")
    
    # 3. Save to PostgreSQL strictly using the final synchronized Request ID
    new_request = MarketplaceRequest(
        request_id=request_id,
        user_sovereign_id=sid,
        user_email=request_in.email,
        user_name=request_in.name,
        origin=request_in.origin,
        destination=request_in.destination,
        cargo_type=request_in.cargo_type,
        weight_kg=request_in.weight,
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
    quotations: Any = None

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
    request_id: str
    forwarder_email: str = ""
    forwarder_company: str
    total_price: float
    currency: str = "USD"
    transit_days: int = 0
    validity_days: int = 7
    carrier: str = ""
    service_type: str = ""
    raw_email: str = ""
    ai_summary: str = ""
    # Optional fields
    quotation_id: str = ""
    forwarder_id: str = ""
    surcharges: Any = None
    payment_terms: str = ""
    notes: str = ""

@router.post("/n8n-sync", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_quote_sync(sync_in: N8nQuoteSync, db: AsyncSession = Depends(get_db)):
    """
    Dedicated highly-secure webhook for n8n to push AI-extracted quotes directly into the Sovereign Database (Postgres).
    Matches QUOTATIONS format.
    """
    # 1. Verify the Request exists
async def n8n_quote_sync(
    sync_in: N8nQuoteSync,
    db: AsyncSession = Depends(get_db)
):
    """
    Highly secure endpoint for n8n WF2 to inject AI-parsed quotations.
    """
    logger.info(f"Received n8n quote sync for request {sync_in.request_id}")
    
    # 1. Look up forwarder by email to get their ID if missing
    forwarder_id = sync_in.forwarder_id or "FWD-UNKNOWN"
    if sync_in.forwarder_email:
        fwd_stmt = select(Forwarder).where(Forwarder.email == sync_in.forwarder_email)
        fwd_res = await db.execute(fwd_stmt)
        fwd = fwd_res.scalars().first()
        if fwd:
            forwarder_id = fwd.forwarder_id
            
    # 2. Get current quote count to generate quotation_id if missing
    req_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == sync_in.request_id)
    req_res = await db.execute(req_stmt)
    req = req_res.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    position = req.quotation_count + 1
    generated_quote_id = sync_in.quotation_id or f"{sync_in.request_id}-Q{position}"
    
    new_bid = MarketplaceBid(
        quotation_id=generated_quote_id,
        request_id=sync_in.request_id,
        forwarder_id=forwarder_id,
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
