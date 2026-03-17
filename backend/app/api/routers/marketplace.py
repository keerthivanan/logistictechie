from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.marketplace import MarketplaceRequest, MarketplaceBid, ForwarderBidStatus
from app.models.forwarder import Forwarder
from sqlalchemy import select, func
from datetime import datetime, timezone
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.webhook import webhook_service
from app.models.user import User
from app.api.deps import get_current_user, verify_n8n_webhook
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.services.activity import activity_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class MarketplaceSubmit(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=100)
    sovereign_id: str = Field("", max_length=50)
    name: str = Field("Client", max_length=200)
    email: str = Field("", max_length=254)
    phone: str = Field("", max_length=30)
    origin: str = Field(..., min_length=1, max_length=200)
    origin_type: str = Field("PORT", max_length=20)
    destination: str = Field(..., min_length=1, max_length=200)
    destination_type: str = Field("PORT", max_length=20)
    cargo_type: str = Field(..., min_length=1, max_length=50)
    commodity: str = Field("", max_length=200)
    cargo_specification: str = Field("", max_length=500)
    packing_type: str = Field("PALLETS", max_length=50)
    quantity: int = Field(1, gt=0, le=50000)
    weight: float = Field(..., gt=0, le=500000)  # max 500 metric tons
    weight_unit: str = Field("KGM", max_length=10)
    dimensions: str = Field("", max_length=100)
    dim_unit: str = Field("CM", max_length=10)
    is_stackable: bool = True
    is_hazardous: bool = False
    needs_insurance: bool = False
    target_date: Optional[str] = None
    pickup_ready_date: Optional[str] = None
    total_weight_kg: Optional[float] = Field(None, gt=0, le=500000)
    total_volume_cbm: Optional[float] = Field(None, gt=0, le=10000)
    container_count: Optional[int] = Field(None, gt=0, le=500)
    container_type: Optional[str] = Field("", max_length=20)
    surcharge_details: Optional[Dict[str, Any]] = None
    vessel: str = Field("", max_length=100)
    special_requirements: str = Field("", max_length=1000)
    incoterms: str = Field("FOB", max_length=10)
    currency: str = Field("USD", min_length=3, max_length=3)

def _fire_webhook(payload: dict):
    """Fire-and-forget webhook in a background thread."""
    asyncio.run(webhook_service.trigger_marketplace_webhook(payload))

@router.post("/submit")
@router.post("/requests/create") # n8n Guide Compatibility Alias
async def submit_request(
    request_in: MarketplaceSubmit,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    # Logic: [SOVEREIGN_ID]-REQ-[COUNT+1] with collision safety (max 50 attempts)
    generated_req_id = None
    offset = 0
    max_attempts = 50
    while not generated_req_id and offset < max_attempts:
        count_stmt = select(func.count(MarketplaceRequest.id)).where(
            MarketplaceRequest.user_sovereign_id == current_user.sovereign_id
        )
        count_res = await db.execute(count_stmt)
        total_existing = count_res.scalar() or 0
        candidate_id = f"{current_user.sovereign_id}-REQ-{total_existing + 1 + offset:02d}"

        # Check if candidate exists (prevents race condition collisions)
        check_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == candidate_id)
        check_res = await db.execute(check_stmt)
        if not check_res.scalars().first():
            generated_req_id = candidate_id
        else:
            offset += 1  # Collision detected, increment and try again
    if not generated_req_id:
        raise HTTPException(status_code=500, detail="Unable to generate unique request ID. Please try again.")

    # 2. Backend prepares the payload.
    # 3. Backend fires the webhook to n8n (Intake).
    # 4. Backend returns the generated request_id.
    
    # Normalize Weight to KG
    weight_kg = request_in.weight
    if request_in.weight_unit.upper() in ["LBS", "LB"]:
        weight_kg = request_in.weight * 0.453592
    
    payload = {
        "request_id": generated_req_id,
        "user_id": str(current_user.id),
        "sovereign_id": current_user.sovereign_id,
        "name": current_user.full_name or "Client",
        "email": current_user.email,
        "phone": current_user.phone_number or request_in.phone,
        "origin": request_in.origin,
        "origin_type": request_in.origin_type,
        "destination": request_in.destination,
        "destination_type": request_in.destination_type,
        "cargo_type": request_in.cargo_type,
        "commodity": request_in.commodity,
        "cargo_specification": request_in.cargo_specification,
        "packing_type": request_in.packing_type,
        "quantity": request_in.quantity,
        "weight_kg": weight_kg,
        "weight_raw": request_in.weight,
        "weight_unit": request_in.weight_unit,
        "dimensions": request_in.dimensions,
        "dim_unit": request_in.dim_unit,
        "is_stackable": request_in.is_stackable,
        "is_hazardous": request_in.is_hazardous,
        "needs_insurance": request_in.needs_insurance,
        "target_date": request_in.target_date,
        "pickup_ready_date": request_in.pickup_ready_date,
        "total_weight_kg": request_in.total_weight_kg or weight_kg,
        "total_volume_cbm": request_in.total_volume_cbm,
        "container_count": request_in.container_count,
        "container_type": request_in.container_type,
        "surcharge_details": request_in.surcharge_details,
        "vessel": request_in.vessel,
        "special_requirements": request_in.special_requirements,
        "incoterms": request_in.incoterms,
        "currency": request_in.currency
    }

    # 2. SAVE TO POSTGRESQL IMMEDIATELY (ZERO LAG DASHBOARD)
    new_request = MarketplaceRequest(
        request_id=generated_req_id,
        user_sovereign_id=current_user.sovereign_id,
        user_email=current_user.email,
        user_phone=current_user.phone_number or request_in.phone,
        user_name=current_user.full_name or "Client",
        origin=request_in.origin,
        origin_type=request_in.origin_type,
        destination=request_in.destination,
        destination_type=request_in.destination_type,
        cargo_type=request_in.cargo_type,
        commodity=request_in.commodity,
        cargo_specification=request_in.cargo_specification,
        packing_type=request_in.packing_type,
        quantity=request_in.quantity,
        weight_kg=weight_kg,
        dimensions=request_in.dimensions,
        is_stackable=request_in.is_stackable,
        is_hazardous=request_in.is_hazardous,
        needs_insurance=request_in.needs_insurance,
        target_date=datetime.fromisoformat(request_in.target_date.replace("Z", "+00:00")).replace(tzinfo=None) if request_in.target_date else None,
        pickup_ready_date=datetime.fromisoformat(request_in.pickup_ready_date.replace("Z", "+00:00")).replace(tzinfo=None) if request_in.pickup_ready_date else None,
        total_weight_kg=request_in.total_weight_kg or weight_kg,
        total_volume_cbm=request_in.total_volume_cbm,
        container_count=request_in.container_count,
        container_type=request_in.container_type,
        surcharge_details=request_in.surcharge_details,
        vessel=request_in.vessel,
        special_requirements=request_in.special_requirements,
        incoterms=request_in.incoterms,
        currency=request_in.currency,
        status="OPEN"
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # 3. Backend fires the webhook to n8n (Intake Brain) via BackgroundTasks
    # This makes the UI "Amazing" by not waiting for n8n's internal logic.
    background_tasks.add_task(webhook_service.trigger_marketplace_webhook, payload)
    
    # We use the generated ID as the source of truth
    request_id = generated_req_id
        
    # LOG ACTIVITY: Track the submission for the Sovereign Dashboard
    await activity_service.log(
        db,
        user_id=str(current_user.id),
        action="MARKETPLACE_SUBMIT",
        entity_type="REQUEST",
        entity_id=request_id,
        metadata=payload
    )
        
    return {
        "success": True, 
        "uniqueId": request_id, 
        "request_id": request_id,
        "sovereign_id": current_user.sovereign_id,
        "status": "PROCESSING",
        "normalized_weight_kg": round(weight_kg, 2)
    }

@router.get("/my-requests")
async def get_my_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ULTIMATE SHIPPER COCKPIT: Returns all requests for the current user.
    Each request includes the list of quotations received so far.
    """
    if current_user.role == "forwarder":
        raise HTTPException(status_code=403, detail="Partners should use /api/forwarder/my-bids")

    # SOVEREIGN IDENTITY RESOLUTION: 
    # If the user is a partner (REG-), they might have historical requests under their old ID.
    sovereign_id = current_user.sovereign_id
    original_id = sovereign_id.replace("REG-", "") 
    
    # Fetch requests (Lookup both identity versions)
    stmt = select(MarketplaceRequest).where(
        MarketplaceRequest.user_sovereign_id.in_([sovereign_id, original_id])
    ).order_by(MarketplaceRequest.submitted_at.desc())
    result = await db.execute(stmt)
    requests = result.scalars().all()
    
    response = []
    for r in requests:
        # Fetch quotes for this request
        quote_stmt = select(MarketplaceBid).where(
            MarketplaceBid.request_id == r.request_id
        ).order_by(MarketplaceBid.total_price.asc())
        quote_res = await db.execute(quote_stmt)
        quotes = quote_res.scalars().all()
        
        response.append({
            "request_id": r.request_id,
            "origin": r.origin,
            "destination": r.destination,
            "cargo_type": r.cargo_type,
            "commodity": r.commodity,
            "cargo_specification": r.cargo_specification,
            "quantity": r.quantity,
            "weight_kg": float(r.weight_kg) if r.weight_kg else None,
            "is_hazardous": r.is_hazardous,
            "needs_insurance": r.needs_insurance,
            "target_date": r.target_date,
            "status": r.status,
            "quotation_count": r.quotation_count or 0,
            "submitted_at": r.submitted_at,
            "quotations": [{
                "quotation_id": q.quotation_id,
                "forwarder_company": q.forwarder_company,
                "total_price": float(q.total_price),
                "currency": q.currency,
                "transit_days": q.transit_days,
                "ai_summary": q.ai_summary,
                "received_at": q.received_at
            } for q in quotes]
        })
        
    return {
        "success": True,
        "sovereign_id": current_user.sovereign_id,
        "requests": response
    }

@router.get("/user/{email}/requests")
async def legacy_get_user_requests(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Legacy bridge for email-based lookup. Auth required; users can only see their own requests."""
    if current_user.email != email and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied.")
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.user_email == email).order_by(MarketplaceRequest.submitted_at.desc())
    result = await db.execute(stmt)
    requests = result.scalars().all()
    return [{"request_id": r.request_id, "status": r.status} for r in requests]

@router.get("/request/{request_id}")
async def get_request_details(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Sovereign Detail: Fetches full request data and all associated quotations.
    """
    # 1. Get Request
    req_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == request_id)
    req_res = await db.execute(req_stmt)
    req = req_res.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found in Mirror.")
        
    if req.user_sovereign_id != current_user.sovereign_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this request.")
    
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
            "origin_type": req.origin_type,
            "destination": req.destination,
            "destination_type": req.destination_type,
            "cargo_type": req.cargo_type,
            "commodity": req.commodity,
            "cargo_specification": req.cargo_specification,
            "packing_type": req.packing_type,
            "quantity": req.quantity,
            "weight_kg": req.weight_kg,
            "total_weight_kg": req.total_weight_kg,
            "total_volume_cbm": req.total_volume_cbm,
            "container_count": req.container_count,
            "container_type": req.container_type,
            "dimensions": req.dimensions,
            "is_stackable": req.is_stackable,
            "is_hazardous": req.is_hazardous,
            "needs_insurance": req.needs_insurance,
            "target_date": req.target_date,
            "pickup_ready_date": req.pickup_ready_date,
            "vessel": req.vessel,
            "special_requirements": req.special_requirements,
            "incoterms": req.incoterms,
            "currency": req.currency,
            "status": req.status,
            "quotation_count": req.quotation_count,
            "submitted_at": req.submitted_at
        },
        "quotations": [{
            "quotation_id": b.quotation_id,
            "forwarder_company": b.forwarder_company,
            "total_price": float(b.total_price) if b.total_price is not None else None,
            "currency": b.currency,
            "transit_days": b.transit_days,
            "ai_summary": b.ai_summary,
            "received_at": b.received_at,
            "carrier": b.carrier,
            "status": b.status
        } for b in bids]
    }

@router.get("/quotes/{request_id}")
async def legacy_get_quotes(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Legacy bridge for existing frontend components."""
    return await get_request_details(request_id, db, current_user)
# n8n Synchronization Protocol Models
class N8nRequestSync(BaseModel):
    request_id: str
    user_sovereign_id: str
    user_email: str
    user_phone: Optional[str] = None
    user_name: str
    origin: str
    origin_type: str = "PORT"
    destination: str
    destination_type: str = "PORT"
    cargo_type: str
    commodity: str = ""
    cargo_specification: str = ""
    packing_type: str = "PALLETS"
    quantity: int = 1
    weight_kg: float
    dimensions: str = ""
    is_stackable: bool = True
    is_hazardous: bool = False
    needs_insurance: bool = False
    target_date: Optional[str] = None
    pickup_ready_date: Optional[str] = None
    total_weight_kg: Optional[float] = None
    total_volume_cbm: Optional[float] = None
    container_count: Optional[int] = None
    container_type: Optional[str] = ""
    vessel: str = ""
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
    from decimal import Decimal
    try:
        logger.info(f"[*] REQUEST SYNC ATTEMPT: {sync_in.request_id}")
        
        # 1. Prepare values dict for the insert
        data_values = {
            "request_id": sync_in.request_id,
            "user_sovereign_id": sync_in.user_sovereign_id,
            "user_email": sync_in.user_email,
            "user_phone": sync_in.user_phone,
            "user_name": sync_in.user_name,
            "origin": sync_in.origin,
            "origin_type": sync_in.origin_type,
            "destination": sync_in.destination,
            "destination_type": sync_in.destination_type,
            "cargo_type": sync_in.cargo_type,
            "commodity": sync_in.commodity,
            "cargo_specification": sync_in.cargo_specification,
            "packing_type": sync_in.packing_type,
            "quantity": sync_in.quantity,
            "weight_kg": Decimal(str(sync_in.weight_kg)),
            "dimensions": sync_in.dimensions,
            "is_stackable": sync_in.is_stackable,
            "is_hazardous": sync_in.is_hazardous,
            "needs_insurance": sync_in.needs_insurance,
            "target_date": datetime.fromisoformat(sync_in.target_date.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.target_date else None,
            "pickup_ready_date": datetime.fromisoformat(sync_in.pickup_ready_date.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.pickup_ready_date else None,
            "total_weight_kg": Decimal(str(sync_in.total_weight_kg)) if sync_in.total_weight_kg is not None else Decimal(str(sync_in.weight_kg)),
            "total_volume_cbm": Decimal(str(sync_in.total_volume_cbm)) if sync_in.total_volume_cbm is not None else None,
            "container_count": sync_in.container_count,
            "container_type": sync_in.container_type,
            "vessel": sync_in.vessel,
            "special_requirements": sync_in.special_requirements,
            "incoterms": sync_in.incoterms,
            "currency": sync_in.currency,
            "status": sync_in.status,
            "submitted_at": datetime.fromisoformat(sync_in.submitted_at.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.submitted_at else datetime.now(timezone.utc)
        }
        
        # 2. Build Insert with Upsert
        stmt = pg_insert(MarketplaceRequest).values(**data_values)
        
        # Conflict resolution: update status if it already exists
        stmt = stmt.on_conflict_do_update(
            index_elements=["request_id"],
            set_={"status": stmt.excluded.status}
        )
        
        await db.execute(stmt)
        await db.commit()
        logger.info(f"[+] REQUEST SYNC SUCCESS: {sync_in.request_id}")
        return {"success": True, "request_id": sync_in.request_id}
    except Exception as e:
        logger.error(f"[-] REQUEST SYNC ERROR: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Request sync failed. Please try again or contact support.")

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
        req.closed_at = datetime.fromisoformat(sync_in.closed_at.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.closed_at else datetime.now(timezone.utc)
        req.closed_reason = sync_in.closed_reason
        await db.commit()
    else:
        # Fallback: if request not found, it might be a sync delay.
        # However, for 'Best of All Time', we should log this.
        logger.warning(f"[RECOVERY] Close requested for non-existent ReqID: {sync_in.request_id}")
        
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
    surcharges: Optional[Dict[str, Any]] = None
    is_hazardous: bool = False
    is_stackable: bool = True
    needs_insurance: bool = False
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
        surcharges=sync_in.surcharges,
        is_hazardous=sync_in.is_hazardous,
        is_stackable=sync_in.is_stackable,
        needs_insurance=sync_in.needs_insurance,
        raw_email=sync_in.raw_email,
        ai_summary=sync_in.ai_summary,
        status=sync_in.status,
        received_at=datetime.fromisoformat(sync_in.received_at.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.received_at else datetime.now(timezone.utc)
    )
    
    stmt = stmt.on_conflict_do_update(
        index_elements=[MarketplaceBid.quotation_id],
        set_={
            "total_price": stmt.excluded.total_price,
            "carrier": stmt.excluded.carrier,
            "ai_summary": stmt.excluded.ai_summary,
            "surcharges": stmt.excluded.surcharges,
            "is_hazardous": stmt.excluded.is_hazardous,
            "is_stackable": stmt.excluded.is_stackable,
            "needs_insurance": stmt.excluded.needs_insurance,
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

class N8nBidStatusSync(BaseModel):
    request_id: str
    forwarder_id: str
    status: str
    price: Optional[float] = None
    attempted_at: Optional[str] = None
    quoted_at: Optional[str] = None

@router.post("/bid-status-sync", dependencies=[Depends(verify_n8n_webhook)])
async def n8n_bid_status_sync(sync_in: N8nBidStatusSync, db: AsyncSession = Depends(get_db)):
    """
    WF2 calls this to log bid attempts (ANSWERED, DECLINED_LATE, DUPLICATE).
    Ensures the forwarder dashboard is in sync with the n8n Brain.
    """
    stmt = pg_insert(ForwarderBidStatus).values(
        request_id=sync_in.request_id,
        forwarder_id=sync_in.forwarder_id,
        status=sync_in.status,
        quoted_price=sync_in.price,
        attempted_at=datetime.fromisoformat(sync_in.attempted_at.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.attempted_at else datetime.now(timezone.utc),
        quoted_at=datetime.fromisoformat(sync_in.quoted_at.replace("Z", "+00:00")).replace(tzinfo=None) if sync_in.quoted_at else None
    )
    
    stmt = stmt.on_conflict_do_update(
        index_elements=[ForwarderBidStatus.request_id, ForwarderBidStatus.forwarder_id],
        set_={
            "status": stmt.excluded.status,
            "quoted_price": stmt.excluded.quoted_price or ForwarderBidStatus.quoted_price,
            "quoted_at": stmt.excluded.quoted_at or ForwarderBidStatus.quoted_at
        }
    )
    
    await db.execute(stmt)
    await db.commit()
    
    return {"success": True, "request_id": sync_in.request_id, "forwarder_id": sync_in.forwarder_id}
