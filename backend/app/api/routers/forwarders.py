from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from fastapi.responses import Response
import base64
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.user import User
from app.models.marketplace import MarketplaceBid, MarketplaceRequest, ForwarderBidStatus
from app.models.conversation import Conversation
from app.api.deps import get_current_user, verify_n8n_webhook
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel, Field
from app.services.activity import activity_service
from app.services.webhook import webhook_service
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ForwarderSave(BaseModel):
    company_name: str
    email: str
    company_email: str = ""
    contact_person: str = ""
    phone: str = ""
    whatsapp: str = ""
    country: str = ""
    specializations: str = ""
    routes: str = ""
    tax_id: str = ""
    website: str = ""
    document_url: str = ""
    logo_url: str = ""
    forwarder_id: str = ""  # n8n can pass this, or we auto-generate
    status: str = "ACTIVE"
    is_verified: bool = False
    is_paid: bool = False

@router.post("/save")
async def save_forwarder(f_in: ForwarderSave, db: AsyncSession = Depends(get_db), _: None = Depends(verify_n8n_webhook)):
    """
    Secure endpoint for n8n Cloud to save a verified partner.
    Called after partner verification succeeds.
    """
    # Check if already exists (idempotent) — case-insensitive email match
    existing = await db.execute(select(Forwarder).where(func.lower(Forwarder.email) == f_in.email.lower().strip()))
    if existing.scalars().first():
        # Role Sync: If profile exists, ensure User record also has forwarder role
        user_stmt = select(User).where(User.email == f_in.email)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        if user and user.role != "forwarder":
            user.role = "forwarder"
            # Ensure sovereign_id starts with REG-
            if not user.sovereign_id.startswith("REG-"):
                user.sovereign_id = f"REG-{user.sovereign_id}"
            await db.commit()
            
        return {"success": True, "message": "Partner already exists. Role synchronized."}
    
    # Auto-generate forwarder_id if n8n didn't provide one
    fwd_id = f_in.forwarder_id
    if not fwd_id:
        count_result = await db.execute(select(func.count()).select_from(Forwarder))
        count = count_result.scalar() or 0
        # Loop until a unique ID is found (handles gaps/deletions)
        offset = 0
        while True:
            candidate = f"F{str(count + 1 + offset).zfill(3)}"
            existing_check = await db.execute(select(Forwarder).where(Forwarder.forwarder_id == candidate))
            if not existing_check.scalars().first():
                fwd_id = candidate
                break
            offset += 1
            if offset > 100:
                raise HTTPException(status_code=500, detail="Unable to generate unique forwarder ID.")
        
    new_f = Forwarder(
        forwarder_id=fwd_id,
        company_name=f_in.company_name,
        contact_person=f_in.contact_person,
        email=f_in.email,
        phone=f_in.phone,
        whatsapp=f_in.whatsapp,
        website=f_in.website,
        country=f_in.country,
        specializations=f_in.specializations,
        routes=f_in.routes,
        tax_id=f_in.tax_id,
        document_url=f_in.document_url,
        logo_url=f_in.logo_url,
        status=f_in.status,
        is_verified=f_in.is_verified,
        is_paid=f_in.is_paid,
        registered_at=datetime.now(timezone.utc).replace(tzinfo=None),
        expires_at=(datetime.now(timezone.utc) + timedelta(days=30)).replace(tzinfo=None)
    )

    db.add(new_f)

    # ROLE SYNC PROTOCOL: Update User role to forwarder
    user_stmt = select(User).where(User.email == f_in.email)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()
    if user:
        user.role = "forwarder"
        if not user.sovereign_id.startswith("REG-"):
            user.sovereign_id = f"REG-{user.sovereign_id}"
    
    await db.commit()
    
    return {
        "success": True,
        "forwarder_id": fwd_id,
        "message": f"Partner {f_in.company_name} saved. ID: {fwd_id}"
    }

@router.put("/activate/{f_id}")
async def activate_forwarder(f_id: str, db: AsyncSession = Depends(get_db), _: None = Depends(verify_n8n_webhook)):
    """
    Activates a forwarder after verification confirmation.
    """
    stmt = select(Forwarder).where(Forwarder.forwarder_id == f_id)
    result = await db.execute(stmt)
    f = result.scalars().first()
    
    if not f:
        raise HTTPException(status_code=404, detail="Partner not found")
        
    f.status = "ACTIVE"
    f.is_verified = True
    f.is_paid = True
    f.expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).replace(tzinfo=None)
    
    await db.commit()
    return {"success": True, "message": "Partner Activated."}

@router.get("/logo/{forwarder_id}")
async def get_forwarder_logo(forwarder_id: str, db: AsyncSession = Depends(get_db)):
    """Serve forwarder logo as image — avoids inlining 150KB base64 in every list response."""
    result = await db.execute(select(Forwarder).where(Forwarder.forwarder_id == forwarder_id))
    fwd = result.scalars().first()
    if not fwd or not fwd.logo_url:
        raise HTTPException(status_code=404, detail="Logo not found")
    if fwd.logo_url.startswith("data:"):
        header, data = fwd.logo_url.split(",", 1)
        content_type = header.split(":")[1].split(";")[0]
        return Response(content=base64.b64decode(data), media_type=content_type)
    raise HTTPException(status_code=404, detail="Logo not found")


@router.get("/active")
async def list_forwarders(db: AsyncSession = Depends(get_db)):
    """
    Returns all verified CargoLink partners as a flat JSON array for n8n compatibility.
    """
    result = await db.execute(select(Forwarder).where(Forwarder.status.in_(["ACTIVE", "APPROVED"])))
    forwarders = result.scalars().all()

    return [
        {
            "id": f.id,
            "forwarder_id": f.forwarder_id,
            "company_name": f.company_name,
            "country": f.country,
            "email": f.email,
            "phone": f.phone,
            "whatsapp": f.whatsapp or "", # CRITICAL for n8n broadcast
            "website": f.website,
            "reliability_score": f.reliability_score,
            "logo_url": f"/api/forwarders/logo/{f.forwarder_id}" if f.logo_url else None,
            "is_verified": f.is_verified,
            "status": f.status,
            "routes": f.routes or "",
            "specializations": f.specializations or "",
            "expires_at": str(f.expires_at) if f.expires_at else None
        } for f in forwarders
    ]

class ForwarderPromote(BaseModel):
    company_name: str
    contact_person: str = ""
    company_email: str = ""
    phone: str = ""
    whatsapp: str = ""
    country: str = ""
    specializations: str = ""
    routes: str = ""
    tax_id: str = ""
    website: str = ""
    document_url: str = ""
    logo_url: str = ""

@router.post("/promote")
async def promote_to_forwarder(
    f_in: ForwarderPromote,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticated endpoint for users to self-register as forwarders.
    Called directly from the frontend registration form.
    """
    email = current_user.email

    if not current_user.sovereign_id:
        raise HTTPException(status_code=400, detail="Account ID not found. Please contact support.")

    # Idempotent — if profile already exists, return current status
    existing_result = await db.execute(select(Forwarder).where(Forwarder.email == email))
    existing = existing_result.scalars().first()
    if existing:
        return {
            "success": True,
            "status": existing.status,
            "message": f"Application status: {existing.status}",
        }

    # Store with PENDING status — user role and sovereign_id unchanged until admin approves
    # forwarder_id uses the original sovereign_id (no REG- prefix yet)
    orig_sovereign_id = current_user.sovereign_id
    fwd_id = f"REG-{orig_sovereign_id}"

    new_f = Forwarder(
        forwarder_id=fwd_id,
        company_name=f_in.company_name,
        contact_person=f_in.contact_person,
        email=email,
        company_email=f_in.company_email or None,
        phone=f_in.phone,
        whatsapp=f_in.whatsapp or f_in.phone,
        website=f_in.website,
        country=f_in.country,
        specializations=f_in.specializations,
        routes=f_in.routes,
        tax_id=f_in.tax_id,
        document_url=f_in.document_url,
        logo_url=f_in.logo_url,
        status="PENDING",       # ← awaiting admin approval
        is_verified=False,
        is_paid=False,
        registered_at=datetime.now(timezone.utc).replace(tzinfo=None),
        expires_at=(datetime.now(timezone.utc) + timedelta(days=365)).replace(tzinfo=None),
    )
    db.add(new_f)
    # Do NOT change user.role or user.sovereign_id — admin approval does that
    await db.commit()

    # Notify n8n of new application
    background_tasks.add_task(webhook_service.trigger_registration_webhook, {
        "forwarder_id": fwd_id,
        "company_name": f_in.company_name,
        "contact_person": f_in.contact_person,
        "email": current_user.email,
        "company_email": f_in.company_email or "",
        "phone": f_in.phone,
        "whatsapp": f_in.whatsapp or f_in.phone,
        "country": f_in.country,
        "specializations": f_in.specializations,
        "routes": f_in.routes,
        "tax_id": f_in.tax_id,
        "website": f_in.website or "",
        "document_url": f_in.document_url or "",
        "logo_url": f_in.logo_url or "",
        "status": "PENDING",
    })

    try:
        await activity_service.log(
            db,
            user_id=str(current_user.id),
            action="PARTNER_APPLIED",
            entity_type="FORWARDER",
            entity_id=fwd_id,
            metadata={"company_name": f_in.company_name, "forwarder_id": fwd_id}
        )
    except Exception:
        pass

    return {
        "success": True,
        "status": "PENDING",
        "forwarder_id": fwd_id,
        "message": "Application submitted. Pending admin approval.",
    }


@router.get("/my-status")
async def get_my_application_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the current user's forwarder application status."""
    result = await db.execute(select(Forwarder).where(Forwarder.email == current_user.email))
    forwarder = result.scalars().first()
    if not forwarder:
        return {"status": "NOT_APPLIED", "forwarder_id": None, "company_name": None}
    return {
        "status": forwarder.status,
        "forwarder_id": forwarder.forwarder_id,
        "company_name": forwarder.company_name,
        "registered_at": str(forwarder.registered_at),
    }


class LoginRequest(BaseModel):
    forwarder_id: str
    email: str

@router.post("/auth")
async def forwarder_auth(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Secure passwordless login for forwarders using their assigned ID + Email combo.
    Rate-limited: 5 failed attempts locks the forwarder account for 15 minutes.
    """
    import time

    # Brute-force guard: check failed attempt count on forwarder record
    stmt = select(Forwarder).where(Forwarder.forwarder_id == req.forwarder_id)
    result = await db.execute(stmt)
    f = result.scalars().first()

    # Always return the same error whether ID exists or not (no enumeration)
    AUTH_FAIL = HTTPException(status_code=401, detail="Invalid Forwarder ID or Email.")

    if not f:
        raise AUTH_FAIL

    # Lockout check
    failed = int(f.failed_auth_attempts or 0)
    locked_until = f.auth_locked_until
    if locked_until and locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        raise AUTH_FAIL

    if f.email.lower() != req.email.lower() or f.status != "ACTIVE":
        f.failed_auth_attempts = failed + 1
        if f.failed_auth_attempts >= 5:
            f.auth_locked_until = (datetime.now(timezone.utc) + timedelta(minutes=15)).replace(tzinfo=None)
        await db.commit()
        raise AUTH_FAIL

    # Success — reset counter
    if failed > 0:
        f.failed_auth_attempts = 0
        f.auth_locked_until = None
        await db.commit()

    return {
        "success": True,
        "forwarder": {
            "id": f.forwarder_id,
            "company_name": f.company_name,
            "email": f.email
        }
    }


@router.get("/my-bids")
async def get_forwarder_bids(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ULTIMATE PARTNER COCKPIT: Returns all bid history for the current partner.
    Includes successful quotes, declined (late) quotes, and duplicates.
    """
    if current_user.role != "forwarder":
        raise HTTPException(status_code=403, detail="Access denied. Partners only.")

    # Look up the forwarder table record to get the actual forwarder_id
    # (sovereign_id ≠ forwarder_id for promoted users)
    fwd_lookup = await db.execute(select(Forwarder).where(Forwarder.email == current_user.email))
    fwd_record = fwd_lookup.scalars().first()
    fwd_id = fwd_record.forwarder_id if fwd_record else current_user.sovereign_id

    # Query the Bid Status history joined with Request details
    stmt = (
        select(
            ForwarderBidStatus.status.label("bid_status"),
            ForwarderBidStatus.quoted_price,
            ForwarderBidStatus.attempted_at,
            ForwarderBidStatus.quoted_at,
            MarketplaceRequest.request_id,
            MarketplaceRequest.origin,
            MarketplaceRequest.destination,
            MarketplaceRequest.cargo_type,
            MarketplaceRequest.status.label("request_status")
        )
        .join(MarketplaceRequest, MarketplaceRequest.request_id == ForwarderBidStatus.request_id)
        .where(ForwarderBidStatus.forwarder_id == fwd_id)
        .order_by(ForwarderBidStatus.attempted_at.desc())
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    return {
        "success": True,
        "forwarder_id": fwd_id,
        "bids": [
            {
                "request_id": r.request_id,
                "origin": r.origin,
                "destination": r.destination,
                "cargo_type": r.cargo_type,
                "request_status": r.request_status,
                "bid_status": r.bid_status,
                "quoted_price": float(r.quoted_price) if r.quoted_price else None,
                "attempted_at": r.attempted_at,
                "quoted_at": r.quoted_at
            } for r in rows
        ]
    }

@router.get("/dashboard/{f_id}")
async def get_forwarder_dashboard(
    f_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns real-time metrics for a partner's dashboard.
    """
    # 1. Verify access — check sovereign_id match OR that forwarder record belongs to this user
    if current_user.role != "admin" and current_user.sovereign_id != f_id:
        owner_check = await db.execute(
            select(Forwarder).where(Forwarder.forwarder_id == f_id, Forwarder.email == current_user.email)
        )
        if not owner_check.scalars().first():
            raise HTTPException(status_code=403, detail="Unauthorized node access.")

    # 2. Fetch Partner Record
    stmt = select(Forwarder).where(Forwarder.forwarder_id == f_id)
    res = await db.execute(stmt)
    fwd = res.scalars().first()
    
    if not fwd:
        raise HTTPException(status_code=404, detail="Partner node not found.")

    # 3. Fetch Metrics
    # Total Bids
    bid_count_stmt = select(func.count(ForwarderBidStatus.id)).where(ForwarderBidStatus.forwarder_id == f_id)
    bid_count_res = await db.execute(bid_count_stmt)
    total_bids = bid_count_res.scalar() or 0

    # Won Bids — shipper selected this forwarder to negotiate (conversation started = quote won)
    won_bids_stmt = select(func.count(Conversation.id)).where(
        Conversation.forwarder_id == f_id,
        Conversation.status.in_(["OPEN", "BOOKED"])
    )
    won_bids_res = await db.execute(won_bids_stmt)
    won_bids = won_bids_res.scalar() or 0

    # Recent Bids
    recent_bids_stmt = (
        select(ForwarderBidStatus, MarketplaceRequest)
        .join(MarketplaceRequest, MarketplaceRequest.request_id == ForwarderBidStatus.request_id)
        .where(ForwarderBidStatus.forwarder_id == f_id)
        .order_by(ForwarderBidStatus.attempted_at.desc())
        .limit(5)
    )
    recent_bids_res = await db.execute(recent_bids_stmt)
    bids = []
    for bid_status, req in recent_bids_res.all():
        bids.append({
            "request_id": req.request_id,
            "origin": req.origin,
            "destination": req.destination,
            "cargo_type": req.cargo_type,
            "your_price": float(bid_status.quoted_price) if bid_status.quoted_price else 0,
            "status": req.status,
            "your_position": None  # Position ranking requires comparing all bids; shown as N/A until request closes
        })

    # Open requests this forwarder hasn't bid on yet
    already_bid_sub = select(MarketplaceBid.request_id).where(MarketplaceBid.forwarder_id == f_id)
    open_req_res = await db.execute(
        select(MarketplaceRequest)
        .where(MarketplaceRequest.status == "OPEN", MarketplaceRequest.request_id.notin_(already_bid_sub))
        .order_by(MarketplaceRequest.submitted_at.desc())
        .limit(20)
    )
    open_requests = [{
        "request_id": r.request_id,
        "origin": r.origin,
        "destination": r.destination,
        "cargo_type": r.cargo_type,
        "commodity": r.commodity or "",
        "weight_kg": float(r.weight_kg) if r.weight_kg else None,
        "quantity": r.quantity,
        "container_type": r.container_type or "",
        "container_count": r.container_count,
        "incoterms": r.incoterms or "",
        "target_date": str(r.target_date) if r.target_date else None,
        "quotation_count": r.quotation_count or 0,
        "submitted_at": str(r.submitted_at),
    } for r in open_req_res.scalars().all()]

    return {
        "company_name": fwd.company_name,
        "metrics": {
            "total_quotes_submitted": total_bids,
            "active_bids": total_bids,
            "won_bids": won_bids,
            "reliability_score": fwd.reliability_score
        },
        "quotes": bids,
        "open_requests": open_requests,
    }


@router.get("/portal-dashboard/{f_id}")
async def portal_forwarder_dashboard(
    f_id: str,
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Portal dashboard — authenticated by forwarder_id + email query param.
    Used when forwarder logs in via portal (no JWT).
    """
    stmt = select(Forwarder).where(
        Forwarder.forwarder_id == f_id,
        func.lower(Forwarder.email) == email.lower(),
        Forwarder.status == "ACTIVE"
    )
    result = await db.execute(stmt)
    fwd = result.scalars().first()
    if not fwd:
        raise HTTPException(status_code=401, detail="Invalid portal credentials.")

    bid_count_res = await db.execute(
        select(func.count(ForwarderBidStatus.id)).where(ForwarderBidStatus.forwarder_id == f_id)
    )
    total_bids = bid_count_res.scalar() or 0

    won_bids_res = await db.execute(
        select(func.count(Conversation.id)).where(
            Conversation.forwarder_id == f_id,
            Conversation.status.in_(["OPEN", "BOOKED"])
        )
    )
    won_bids = won_bids_res.scalar() or 0

    recent_bids_stmt = (
        select(ForwarderBidStatus, MarketplaceRequest)
        .join(MarketplaceRequest, MarketplaceRequest.request_id == ForwarderBidStatus.request_id)
        .where(ForwarderBidStatus.forwarder_id == f_id)
        .order_by(ForwarderBidStatus.attempted_at.desc())
        .limit(10)
    )
    recent_bids_res = await db.execute(recent_bids_stmt)
    bids = []
    for bid_status, req in recent_bids_res.all():
        bids.append({
            "request_id": req.request_id,
            "origin": req.origin,
            "destination": req.destination,
            "cargo_type": req.cargo_type,
            "your_price": float(bid_status.quoted_price) if bid_status.quoted_price else 0,
            "status": req.status,
            "your_position": None
        })

    # Open requests: shipper requests + F2F from OTHER forwarders (never own F2F posts)
    from sqlalchemy import or_ as _or
    already_bid_sub = select(MarketplaceBid.request_id).where(MarketplaceBid.forwarder_id == f_id)
    open_req_res = await db.execute(
        select(MarketplaceRequest)
        .where(
            MarketplaceRequest.status == "OPEN",
            MarketplaceRequest.request_id.notin_(already_bid_sub),
            _or(
                MarketplaceRequest.is_f2f == False,           # shipper requests  # noqa: E712
                MarketplaceRequest.posted_by_forwarder_id != f_id  # F2F from others
            )
        )
        .order_by(MarketplaceRequest.is_f2f.desc(), MarketplaceRequest.submitted_at.desc())
        .limit(20)
    )
    open_requests = [{
        "request_id": r.request_id,
        "origin": r.origin,
        "destination": r.destination,
        "cargo_type": r.cargo_type,
        "commodity": r.commodity or "",
        "weight_kg": float(r.weight_kg) if r.weight_kg else None,
        "quantity": r.quantity,
        "container_type": r.container_type or "",
        "container_count": r.container_count,
        "incoterms": r.incoterms or "",
        "target_date": str(r.target_date) if r.target_date else None,
        "quotation_count": r.quotation_count or 0,
        "submitted_at": str(r.submitted_at),
        "is_f2f": r.is_f2f,
        "posted_by_forwarder_id": r.posted_by_forwarder_id if r.is_f2f else None,
    } for r in open_req_res.scalars().all()]

    return {
        "company_name": fwd.company_name,
        "metrics": {
            "total_quotes_submitted": total_bids,
            "active_bids": total_bids,
            "won_bids": won_bids,
            "reliability_score": fwd.reliability_score
        },
        "quotes": bids,
        "open_requests": open_requests,
    }


class PortalBidSubmit(BaseModel):
    forwarder_id: str
    email: str
    request_id: str
    price: float = Field(..., gt=0, le=1_000_000)
    currency: str = "USD"
    transit_days: Optional[int] = None
    carrier: Optional[str] = None
    notes: Optional[str] = None
    status: str = "ANSWERED"

@router.post("/portal-bid")
async def portal_submit_bid(bid_in: PortalBidSubmit, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """
    Portal bid submission endpoint — authenticated by forwarder_id + email pair.
    Called directly from the Forwarder Portal UI (no n8n secret required).
    """
    # Validate forwarder identity
    stmt = select(Forwarder).where(
        Forwarder.forwarder_id == bid_in.forwarder_id,
        func.lower(Forwarder.email) == bid_in.email.lower(),
        Forwarder.status == "ACTIVE"
    )
    result = await db.execute(stmt)
    fwd = result.scalars().first()
    if not fwd:
        raise HTTPException(status_code=401, detail="Invalid forwarder credentials.")

    from app.models.marketplace import ForwarderBidStatus, MarketplaceRequest
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    # Validate request exists
    req_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == bid_in.request_id)
    req_res = await db.execute(req_stmt)
    req = req_res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")

    # Block submissions on closed requests
    if req.status == "CLOSED":
        raise HTTPException(
            status_code=409,
            detail="This request is no longer accepting quotes — it has been fulfilled."
        )

    # Hard-enforce max quotes per request
    if (req.quotation_count or 0) >= settings.MAX_QUOTES_PER_REQUEST:
        raise HTTPException(
            status_code=409,
            detail=f"This request already has {settings.MAX_QUOTES_PER_REQUEST} quotes and is no longer accepting new submissions."
        )

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Block portal submission if this forwarder already quoted via email (Path A)
    existing_quote_stmt = select(MarketplaceBid).where(
        MarketplaceBid.request_id == bid_in.request_id,
        MarketplaceBid.forwarder_id == bid_in.forwarder_id,
    )
    existing_quote_res = await db.execute(existing_quote_stmt)
    existing_quote = existing_quote_res.scalars().first()
    if existing_quote and not existing_quote.quotation_id.startswith("PORTAL-"):
        raise HTTPException(
            status_code=409,
            detail="You have already submitted a quote for this request via email. No further submission needed."
        )

    # 1. Upsert ForwarderBidStatus (partner tracking)
    bid_status_stmt = pg_insert(ForwarderBidStatus).values(
        forwarder_id=bid_in.forwarder_id,
        request_id=bid_in.request_id,
        status=bid_in.status,
        quoted_price=bid_in.price,
        attempted_at=now,
        quoted_at=now,
    )
    bid_status_stmt = bid_status_stmt.on_conflict_do_update(
        index_elements=["forwarder_id", "request_id"],
        set_={"status": bid_status_stmt.excluded.status, "quoted_price": bid_status_stmt.excluded.quoted_price, "quoted_at": bid_status_stmt.excluded.quoted_at}
    )
    await db.execute(bid_status_stmt)

    # 2. Upsert MarketplaceBid (shipowner-visible quote table)
    # Use a deterministic quotation_id so re-submitting updates rather than duplicates
    quotation_id = f"PORTAL-{bid_in.forwarder_id}-{bid_in.request_id}"
    bid_record_stmt = pg_insert(MarketplaceBid).values(
        quotation_id=quotation_id,
        request_id=bid_in.request_id,
        forwarder_id=bid_in.forwarder_id,
        forwarder_email=fwd.email,
        forwarder_company=fwd.company_name,
        total_price=bid_in.price,
        currency=bid_in.currency,
        transit_days=bid_in.transit_days,
        carrier=bid_in.carrier,
        service_type=None,
        notes=bid_in.notes,
        ai_summary=f"Direct quote submitted by {fwd.company_name} via the Partner Portal."
            + (f" Transit: {bid_in.transit_days} days." if bid_in.transit_days else "")
            + (f" Carrier: {bid_in.carrier}." if bid_in.carrier else ""),
        status="ACTIVE",
        received_at=now,
    )
    bid_record_stmt = bid_record_stmt.on_conflict_do_update(
        index_elements=["quotation_id"],
        set_={
            "total_price": bid_record_stmt.excluded.total_price,
            "ai_summary": bid_record_stmt.excluded.ai_summary,
            "status": bid_record_stmt.excluded.status,
        }
    )
    await db.execute(bid_record_stmt)

    # 3. Update quotation_count on the request (count actual bids for accuracy)
    count_stmt = select(func.count(MarketplaceBid.id)).where(MarketplaceBid.request_id == bid_in.request_id)
    count_res = await db.execute(count_stmt)
    new_count = count_res.scalar() or 0
    req.quotation_count = new_count

    # 4. Auto-close request when 3 quotes received (same threshold as n8n WF3)
    should_send_comparison = False
    if new_count >= settings.MAX_QUOTES_PER_REQUEST and req.status == "OPEN":
        req.status = "CLOSED"
        req.closed_reason = "Auto-closed: 3 quotes received via portal"
        req.closed_at = now
        should_send_comparison = True

    await db.commit()

    # Always send forwarder a bid confirmation email (viceversa: portal submit → Gmail confirm)
    background_tasks.add_task(webhook_service.trigger_bid_confirmation_webhook, {
        "forwarder_email": fwd.email,
        "forwarder_company": fwd.company_name,
        "forwarder_id": bid_in.forwarder_id,
        "request_id": bid_in.request_id,
        "origin": req.origin,
        "destination": req.destination,
        "price": bid_in.price,
        "currency": bid_in.currency,
        "submitted_at": now.isoformat(),
    })

    # If 3 quotes reached via portal, notify shipper with comparison email
    if should_send_comparison:
        shipper_stmt = select(User).where(User.email == req.user_email)
        shipper_res = await db.execute(shipper_stmt)
        shipper = shipper_res.scalars().first()
        if shipper:
            background_tasks.add_task(webhook_service.trigger_quotes_complete_webhook, {
                "request_id": req.request_id,
                "origin": req.origin,
                "destination": req.destination,
                "user_name": shipper.full_name or shipper.email,
                "user_email": shipper.email,
                "quotation_count": new_count,
            })

    # Log bid submission against the forwarder's user account
    user_stmt = select(User).where(User.email == bid_in.email)
    user_res = await db.execute(user_stmt)
    bid_user = user_res.scalars().first()
    if bid_user:
        try:
            await activity_service.log(
                db,
                user_id=str(bid_user.id),
                action="BID_SUBMITTED",
                entity_type="REQUEST",
                entity_id=str(bid_in.request_id),
                metadata={"forwarder_id": bid_in.forwarder_id, "price": bid_in.price, "request_id": bid_in.request_id}
            )
        except Exception:
            pass

    # Notify shipper of new quote (in-app notification via activity log)
    shipper_user_stmt = select(User).where(User.email == req.user_email)
    shipper_user_res = await db.execute(shipper_user_stmt)
    shipper_user = shipper_user_res.scalars().first()
    if shipper_user:
        try:
            await activity_service.log(
                db,
                user_id=str(shipper_user.id),
                action="NEW_QUOTE",
                entity_type="REQUEST",
                entity_id=str(bid_in.request_id),
                metadata={
                    "forwarder_company": fwd.company_name,
                    "forwarder_id": bid_in.forwarder_id,
                    "price": bid_in.price,
                    "request_id": bid_in.request_id,
                    "quotation_count": new_count,
                }
            )
        except Exception:
            pass

    return {
        "success": True,
        "quotation_id": quotation_id,
        "request_id": bid_in.request_id,
        "forwarder_id": bid_in.forwarder_id,
        "quotation_count": new_count,
        "trigger_close": new_count >= settings.MAX_QUOTES_PER_REQUEST,
    }

