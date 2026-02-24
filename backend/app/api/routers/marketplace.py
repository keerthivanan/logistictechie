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

router = APIRouter()

class MarketplaceSubmit(BaseModel):
    origin_city: str
    origin_country: str
    dest_city: str
    dest_country: str
    cargo_type: str
    weight_kg: float
    volume_cbm: float = 0
    cargo_details: str = ""
    user_id: str
    sovereign_id: str = ""  # OMEGO-0009
    user_name: str = "Client"
    user_email: str = ""
    cargo_value: float = 0
    incoterms: str = "FOB"
    notes: str = ""

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
    Request ID format: OMEGO-0009-REQ-01 (user's sovereign_id + per-user counter)
    """
    sid = request_in.sovereign_id or "OMEGO-0000"
    
    # Count THIS user's requests (per-user sequential counter)
    user_count = await db.execute(
        select(func.count()).select_from(MarketplaceRequest)
        .where(MarketplaceRequest.sovereign_id == sid)
    )
    seq = (user_count.scalar() or 0) + 1
    request_id = f"{sid}-REQ-{str(seq).zfill(2)}"
    
    new_request = MarketplaceRequest(
        request_id=request_id,
        sovereign_id=sid,
        user_id=request_in.user_id,
        user_name=request_in.user_name,
        user_email=request_in.user_email,
        origin_city=request_in.origin_city,
        origin_country=request_in.origin_country,
        dest_city=request_in.dest_city,
        dest_country=request_in.dest_country,
        cargo_type=request_in.cargo_type,
        weight_kg=request_in.weight_kg,
        volume_cbm=request_in.volume_cbm,
        cargo_value=request_in.cargo_value,
        incoterms=request_in.incoterms,
        cargo_details=request_in.cargo_details,
        notes=request_in.notes,
        status="OPEN",
        quotes_count=0
    )
    
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Fire webhook to n8n Cloud (non-blocking — never delays user response)
    background_tasks.add_task(_fire_webhook, {
        "request_id": request_id,
        "sovereign_id": sid,
        "origin": f"{request_in.origin_city}, {request_in.origin_country}",
        "destination": f"{request_in.dest_city}, {request_in.dest_country}",
        "cargo_type": request_in.cargo_type,
        "weight": request_in.weight_kg,
        "volume": request_in.volume_cbm,
        "cargo_value": request_in.cargo_value,
        "incoterms": request_in.incoterms,
        "details": request_in.cargo_details,
        "notes": request_in.notes,
        "user_id": request_in.user_id,
        "user_name": request_in.user_name,
        "user_email": request_in.user_email
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
            "forwarder_id": b.forwarder_id,
            "price": b.price,
            "currency": b.currency,
            "transit_days": b.transit_days,
            "mode": b.mode or req.cargo_type,
            "terms": b.terms,
            "validity_days": b.validity_days,
            "company_name": b.vendor_name,
            "logo_url": b.vendor_logo,
            "country": b.vendor_country,
            "position": b.position,
            "notes": b.notes
        })
        
    return {
        "request_id": request_id,
        "status": req.status,
        "quotes_count": req.quotes_count,
        "quotes": formatted_quotes
    }

class QuoteSubmit(BaseModel):
    request_id: str
    forwarder_id: str
    price: float
    currency: str = "USD"
    transit_days: int
    mode: str = ""
    terms: str = ""
    validity_days: int = 7
    vendor_name: str = ""
    vendor_logo: str = ""
    vendor_country: str = ""
    raw_reply: str = ""
    notes: str = ""

@router.post("/quote/submit")
async def submit_quote(bid_in: QuoteSubmit, db: AsyncSession = Depends(get_db)):
    """
    n8n calls this endpoint to inject an AI-extracted quote.
    Implements First-3 atomic counter logic.
    """
    # Find the request by request_id
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == bid_in.request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        return {"accepted": False, "reason": "not_found"}
        
    # Atomic counter check
    if req.quotes_count >= 3 or req.status == "CLOSED":
        return {"accepted": False, "reason": "closed"}
        
    # Increment counter
    req.quotes_count += 1
    position = req.quotes_count
    
    # Auto-close at 3
    if req.quotes_count >= 3:
        req.status = "CLOSED"
        req.closed_at = datetime.utcnow()
    
    # Save the quote
    new_bid = MarketplaceBid(
        request_id=bid_in.request_id,
        forwarder_id=bid_in.forwarder_id,
        price=bid_in.price,
        currency=bid_in.currency,
        transit_days=bid_in.transit_days,
        mode=bid_in.mode,
        terms=bid_in.terms,
        validity_days=bid_in.validity_days,
        vendor_name=bid_in.vendor_name,
        vendor_logo=bid_in.vendor_logo,
        vendor_country=bid_in.vendor_country,
        raw_reply=bid_in.raw_reply,
        position=position,
        notes=bid_in.notes
    )
    
    db.add(new_bid)
    await db.commit()
    
    return {
        "accepted": True,
        "position": position,
        "quotes_count": req.quotes_count,
        "is_now_closed": req.status == "CLOSED"
    }
