from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.forwarder import Forwarder
from sqlalchemy import select, func
from datetime import datetime
import uuid, asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.webhook import webhook_service
from app.models.user import User
from app.api import deps
from app.api.deps import verify_n8n_webhook
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.services.activity import activity_service

router = APIRouter()

class MarketplaceSubmit(BaseModel):
    user_id: str
    sovereign_id: str = ""
    name: str = "Client"
    email: str = ""
    phone: str = ""
    origin: str
    origin_type: str = "PORT"
    destination: str
    destination_type: str = "PORT"
    cargo_type: str
    commodity: str = ""
    packing_type: str = "PALLETS"
    quantity: int = 1
    weight: float
    weight_unit: str = "KGM"
    dimensions: str = ""
    dim_unit: str = "CM"
    is_stackable: bool = True
    is_hazardous: bool = False
    needs_insurance: bool = False
    target_date: Optional[str] = None
    special_requirements: str = ""
    incoterms: str = "FOB"
    currency: str = "USD"

def _fire_webhook(payload: dict):
    """Fire-and-forget webhook in a background thread."""
    asyncio.run(webhook_service.trigger_marketplace_webhook(payload))

@router.post("/submit")
async def submit_request(
    request_in: MarketplaceSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    User submits a cargo quotation request via the 'Sovereign Protocol'.
    🛡️ ROLE GATEKEEPER: Forwarders cannot post requests.
    """
    if current_user.role == "forwarder":
        raise HTTPException(
            status_code=403, 
            detail="Registered Partners cannot post shipment requests. Please use a Client account for shipping."
        )

    # 1. Backend prepares the payload.
    # 2. Backend fires the webhook to n8n (Intake).
    # 3. Backend returns the n8n-assigned request_id to the frontend.
    # 4. n8n is responsible for writing to both Sheets AND PostgreSQL.
    
    # Normalize Weight to KG for the Sovereign Mirror
    weight_kg = request_in.weight
    if request_in.weight_unit.upper() in ["LBS", "LB"]:
        weight_kg = request_in.weight * 0.453592
    
    payload = {
        "user_id": request_in.user_id,
        "sovereign_id": request_in.sovereign_id,
        "name": request_in.name,
        "email": request_in.email,
        "phone": request_in.phone,
        "origin": request_in.origin,
        "origin_type": request_in.origin_type,
        "destination": request_in.destination,
        "destination_type": request_in.destination_type,
        "cargo_type": request_in.cargo_type,
        "commodity": request_in.commodity,
        "packing_type": request_in.packing_type,
        "quantity": request_in.quantity,
        "weight": weight_kg,
        "weight_raw": request_in.weight,
        "weight_unit": request_in.weight_unit,
        "dimensions": request_in.dimensions,
        "dim_unit": request_in.dim_unit,
        "is_stackable": request_in.is_stackable,
        "is_hazardous": request_in.is_hazardous,
        "needs_insurance": request_in.needs_insurance,
        "target_date": request_in.target_date,
        "special_requirements": request_in.special_requirements,
        "incoterms": request_in.incoterms,
        "currency": request_in.currency
    }

    # Fire webhook synchronously to n8n (The Master Processor)
    n8n_response = await webhook_service.trigger_marketplace_webhook(payload)
    
    if not n8n_response or not n8n_response.get("request_id"):
        # Critical Fallback if n8n is unreachable
        sid = request_in.sovereign_id or "OMEGO-0000"
        request_id = f"{sid}-REQ-PENDING"
    else:
        request_id = n8n_response.get("request_id")
        
    # LOG ACTIVITY: Track the submission for the Sovereign Dashboard
    await activity_service.log(
        db,
        user_id=request_in.user_id,
        action="MARKETPLACE_SUBMIT",
        entity_type="REQUEST",
        entity_id=request_id,
        extra_data=payload
    )
        
    return {
        "success": True, 
        "uniqueId": request_id, 
        "request_id": request_id,
        "sovereign_id": request_in.sovereign_id, # Echo back for safety
        "status": "SENT_TO_COMMAND_CENTER",
        "normalized_weight_kg": round(weight_kg, 2)
    }

@router.get("/user/{email}/requests")
async def get_user_requests(email: str, db: AsyncSession = Depends(get_db)):
    """
    Sovereign Dashboard: Fetches all requests for a specific user mirror.
    """
    stmt = select(MarketplaceRequest).where(
        MarketplaceRequest.user_email == email
    ).order_by(MarketplaceRequest.submitted_at.desc())
    result = await db.execute(stmt)
    requests = result.scalars().all()
    
    return [{
        "request_id": r.request_id,
        "origin": r.origin,
        "destination": r.destination,
        "cargo_type": r.cargo_type,
        "status": r.status,
        "quotation_count": r.quotation_count,
        "submitted_at": r.submitted_at
    } for r in requests]

@router.get("/request/{request_id}")
async def get_request_details(request_id: str, db: AsyncSession = Depends(get_db)):
    """
    Sovereign Detail: Fetches full request data and all associated quotations.
    """
    # 1. Get Request
    req_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == request_id)
    req_res = await db.execute(req_stmt)
    req = req_res.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found in Mirror.")
    
    # 2. Get Quotations
    bid_stmt = select(MarketplaceBid).where(
        MarketplaceBid.request_id == request_id
    ).order_by(MarketplaceBid.total_price.asc())
    bid_res = await db.execute(bid_stmt)
    bids = bid_res.scalars().all()
    
    return {
        "request": {
            "request_id": req.request_id,
            "user_name": req.user_name,
            "origin": req.origin,
            "destination": req.destination,
            "cargo_type": req.cargo_type,
            "weight_kg": req.weight_kg,
            "status": req.status,
            "quotation_count": req.quotation_count,
            "submitted_at": req.submitted_at
        },
        "quotations": [{
            "quotation_id": b.quotation_id,
            "forwarder_company": b.forwarder_company,
            "total_price": b.total_price,
            "currency": b.currency,
            "transit_days": b.transit_days,
            "ai_summary": b.ai_summary,
            "received_at": b.received_at,
            "carrier": b.carrier,
            "status": b.status
        } for b in bids]
    }

@router.get("/quotes/{request_id}")
async def legacy_get_quotes(request_id: str, db: AsyncSession = Depends(get_db)):
    """Legacy bridge for existing frontend components."""
    return await get_request_details(request_id, db)
# n8n Synchronization Protocol Models
class N8nRequestSync(BaseModel):
    request_id: str
    user_sovereign_id: str
    user_email: str
    user_name: str
    origin: str
    destination: str
    cargo_type: str
    weight_kg: float
    dimensions: str = ""
    special_requirements: str = ""
    incoterms: str = "FOB"
    currency: str = "USD"
    status: str = "OPEN"
    submitted_at: Optional[str] = None

@router.post("/request-sync", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_request_sync(sync_in: N8nRequestSync, db: AsyncSession = Depends(get_db)):
    """
    WF1 calls this to push the newly created request into Postgres.
    This ensures the dashboard is populated immediately.
    """
    stmt = pg_insert(MarketplaceRequest).values(
        request_id=sync_in.request_id,
        user_sovereign_id=sync_in.user_sovereign_id,
        user_email=sync_in.user_email,
        user_name=sync_in.user_name,
        origin=sync_in.origin,
        destination=sync_in.destination,
        cargo_type=sync_in.cargo_type,
        weight_kg=sync_in.weight_kg,
        dimensions=sync_in.dimensions,
        special_requirements=sync_in.special_requirements,
        incoterms=sync_in.incoterms,
        currency=sync_in.currency,
        status=sync_in.status,
        submitted_at=datetime.fromisoformat(sync_in.submitted_at.replace("Z", "+00:00")) if sync_in.submitted_at else datetime.utcnow()
    )
    
    # Conflict resolution: update status if it already exists
    stmt = stmt.on_conflict_do_update(
        index_elements=[MarketplaceRequest.request_id],
        set_={
            "status": stmt.excluded.status,
            "quotation_count": MarketplaceRequest.quotation_count # Preserve existing count
        }
    )
    
    await db.execute(stmt)
    await db.commit()
    
    return {"success": True, "request_id": sync_in.request_id}

class N8nStatusUpdate(BaseModel):
    request_id: str
    status: str
    closed_at: Optional[str] = None
    closed_reason: Optional[str] = None

@router.post("/close", dependencies=[Depends(verify_n8n_webhook)])
@router.post("/requests/close", dependencies=[Depends(verify_n8n_webhook)]) # ALIAS for WF3 compatibility
async def n8n_requests_close(sync_in: N8nStatusUpdate, db: AsyncSession = Depends(get_db)):
    """
    Webhook for n8n (WF3) to notify the backend of closure.
    """
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == sync_in.request_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if req:
        req.status = sync_in.status
        req.closed_at = datetime.fromisoformat(sync_in.closed_at.replace("Z", "+00:00")) if sync_in.closed_at else datetime.utcnow()
        req.closed_reason = sync_in.closed_reason
        await db.commit()
    else:
        # Fallback: if request not found, it might be a sync delay.
        # However, for 'Best of All Time', we should log this.
        print(f"[RECOVERY] Close requested for non-existent ReqID: {sync_in.request_id}")
        
    return {
        "success": True, 
        "message": f"Status closure acknowledged for {sync_in.request_id}."
    }

class N8nQuoteSync(BaseModel):
    quotation_id: str
    request_id: str
    forwarder_id: str
    forwarder_email: str
    forwarder_company: str
    total_price: float = Field(..., alias="price")
    currency: str = "USD"
    transit_days: int = 0
    validity_days: int = 7
    carrier: str = ""
    service_type: str = ""
    raw_email: str = ""
    ai_summary: str = Field("", alias="summary")
    status: Optional[str] = "ACTIVE" # Optional to allow for just counts
    received_at: Optional[str] = None
    quotation_count: Optional[int] = None # Atomic count sync

    class Config:
        populate_by_name = True

@router.post("/quotations/new", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_quotations_new(sync_in: N8nQuoteSync, db: AsyncSession = Depends(get_db)):
    """Atomic upsert for WF2 quotations."""
    return await n8n_quote_sync(sync_in, db)

@router.post("/n8n-sync", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_quote_sync(
    sync_in: N8nQuoteSync,
    db: AsyncSession = Depends(get_db)
):
    """
    High-performance upsert for WF2 results.
    """
    # 1. Upsert the Quotation
    stmt = pg_insert(MarketplaceBid).values(
        quotation_id=sync_in.quotation_id,
        request_id=sync_in.request_id,
        forwarder_id=sync_in.forwarder_id,
        forwarder_email=sync_in.forwarder_email,
        forwarder_company=sync_in.forwarder_company,
        total_price=sync_in.total_price,
        currency=sync_in.currency,
        transit_days=sync_in.transit_days,
        validity_days=sync_in.validity_days,
        carrier=sync_in.carrier,
        service_type=sync_in.service_type,
        raw_email=sync_in.raw_email,
        ai_summary=sync_in.ai_summary,
        status=sync_in.status,
        received_at=datetime.fromisoformat(sync_in.received_at.replace("Z", "+00:00")) if sync_in.received_at else datetime.utcnow()
    )
    
    stmt = stmt.on_conflict_do_update(
        index_elements=[MarketplaceBid.quotation_id],
        set_={
            "total_price": stmt.excluded.total_price,
            "status": stmt.excluded.status
        }
    )
    
    await db.execute(stmt)
    
    # 2. Increment Quotation Count on the Request
    update_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == sync_in.request_id)
    req_res = await db.execute(update_stmt)
    req = req_res.scalars().first()
    if req:
        if sync_in.quotation_count is not None:
            req.quotation_count = sync_in.quotation_count
        else:
            # Count actual quotes in DB to be safe
            count_stmt = select(func.count(MarketplaceBid.id)).where(MarketplaceBid.request_id == sync_in.request_id)
            count_res = await db.execute(count_stmt)
            req.quotation_count = count_res.scalar() or 0
        
    await db.commit()
    
    return {
        "success": True,
        "request_id": sync_in.request_id
    }
