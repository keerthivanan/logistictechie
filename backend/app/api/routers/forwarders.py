from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.user import User
from app.models.marketplace import MarketplaceBid, MarketplaceRequest, ForwarderBidStatus
from app.api.deps import get_current_user, verify_n8n_webhook
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from app.services.activity import activity_service
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
    # Check if already exists (idempotent)
    existing = await db.execute(select(Forwarder).where(Forwarder.email == f_in.email))
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
            "logo_url": f.logo_url,
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticated endpoint for users to self-register as forwarders.
    Called directly from the frontend registration form.
    """
    email = current_user.email

    if not current_user.sovereign_id:
        raise HTTPException(status_code=400, detail="Account has no Sovereign ID. Please contact support.")

    # Idempotent — if profile already exists, sync role and return
    existing = await db.execute(select(Forwarder).where(Forwarder.email == email))
    if existing.scalars().first():
        if current_user.role != "forwarder":
            current_user.role = "forwarder"
            if not current_user.sovereign_id.startswith("REG-"):
                current_user.sovereign_id = f"REG-{current_user.sovereign_id}"
            await db.commit()
        return {"success": True, "message": "Forwarder profile already exists. Role synchronized."}

    # forwarder_id must match the new sovereign_id so bid queries align
    # Guard: never double-prefix if sovereign_id already has REG- (e.g. retry after partial failure)
    old_sovereign_id = current_user.sovereign_id
    fwd_id = old_sovereign_id if old_sovereign_id.startswith("REG-") else f"REG-{old_sovereign_id}"

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
        status="ACTIVE",
        is_verified=False,
        is_paid=False,
        registered_at=datetime.now(timezone.utc).replace(tzinfo=None),
        expires_at=(datetime.now(timezone.utc) + timedelta(days=30)).replace(tzinfo=None),
    )
    db.add(new_f)

    # Promote user role and assign matching sovereign_id
    current_user.role = "forwarder"
    current_user.sovereign_id = fwd_id

    await db.commit()

    # Log PARTNER_REGISTERED activity
    try:
        await activity_service.log(
            db,
            user_id=str(current_user.id),
            action="PARTNER_REGISTERED",
            entity_type="FORWARDER",
            entity_id=fwd_id,
            metadata={"company_name": f_in.company_name, "forwarder_id": fwd_id}
        )
    except Exception:
        pass  # Never block registration due to activity logging failure

    return {
        "success": True,
        "forwarder_id": fwd_id,
        "message": f"Partner {f_in.company_name} registered. ID: {fwd_id}",
    }


class LoginRequest(BaseModel):
    forwarder_id: str
    email: str

@router.post("/auth")
async def forwarder_auth(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Secure passwordless login for forwarders using their assigned ID + Email combo.
    Rate-limited: 5 failed attempts locks the forwarder account for 15 minutes.
    """
    import time
    from fastapi import Request as FastAPIRequest

    # Brute-force guard: check failed attempt count on forwarder record
    stmt = select(Forwarder).where(Forwarder.forwarder_id == req.forwarder_id)
    result = await db.execute(stmt)
    f = result.scalars().first()

    # Always return the same error whether ID exists or not (no enumeration)
    AUTH_FAIL = HTTPException(status_code=401, detail="Invalid Forwarder ID or Email.")

    if not f:
        raise AUTH_FAIL

    # Lockout check
    failed = int(f.failed_auth_attempts or 0) if hasattr(f, 'failed_auth_attempts') else 0
    locked_until = getattr(f, 'auth_locked_until', None)
    if locked_until and locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        raise AUTH_FAIL

    if f.email != req.email or f.status != "ACTIVE":
        # Increment fail counter
        if hasattr(f, 'failed_auth_attempts'):
            f.failed_auth_attempts = failed + 1
            if f.failed_auth_attempts >= 5 and hasattr(f, 'auth_locked_until'):
                f.auth_locked_until = (datetime.now(timezone.utc) + timedelta(minutes=15)).replace(tzinfo=None)
            await db.commit()
        raise AUTH_FAIL

    # Success — reset counter
    if hasattr(f, 'failed_auth_attempts') and failed > 0:
        f.failed_auth_attempts = 0
        if hasattr(f, 'auth_locked_until'):
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
        .where(ForwarderBidStatus.forwarder_id == current_user.sovereign_id)
        .order_by(ForwarderBidStatus.attempted_at.desc())
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    return {
        "success": True,
        "sovereign_id": current_user.sovereign_id,
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
    # 1. Verify access
    if current_user.sovereign_id != f_id and current_user.role != "admin":
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

    # Won Bids (ACCEPTED or COMPLETED status)
    won_bids_stmt = select(func.count(ForwarderBidStatus.id)).where(
        ForwarderBidStatus.forwarder_id == f_id,
        ForwarderBidStatus.status.in_(["ACCEPTED", "COMPLETED"])
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

    return {
        "company_name": fwd.company_name,
        "metrics": {
            "total_quotes_submitted": total_bids,
            "active_bids": total_bids,
            "won_bids": won_bids,
            "reliability_score": fwd.reliability_score
        },
        "quotes": bids
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
        Forwarder.email == email,
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
        select(func.count(ForwarderBidStatus.id)).where(
            ForwarderBidStatus.forwarder_id == f_id,
            ForwarderBidStatus.status.in_(["ACCEPTED", "COMPLETED"])
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

    return {
        "company_name": fwd.company_name,
        "metrics": {
            "total_quotes_submitted": total_bids,
            "active_bids": total_bids,
            "won_bids": won_bids,
            "reliability_score": fwd.reliability_score
        },
        "quotes": bids
    }


class PortalBidSubmit(BaseModel):
    forwarder_id: str
    email: str
    request_id: str
    price: float
    status: str = "ANSWERED"

@router.post("/portal-bid")
async def portal_submit_bid(bid_in: PortalBidSubmit, db: AsyncSession = Depends(get_db)):
    """
    Portal bid submission endpoint — authenticated by forwarder_id + email pair.
    Called directly from the Forwarder Portal UI (no n8n secret required).
    """
    # Validate forwarder identity
    stmt = select(Forwarder).where(
        Forwarder.forwarder_id == bid_in.forwarder_id,
        Forwarder.email == bid_in.email,
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

    stmt = pg_insert(ForwarderBidStatus).values(
        forwarder_id=bid_in.forwarder_id,
        request_id=bid_in.request_id,
        status=bid_in.status,
        quoted_price=bid_in.price,
        attempted_at=datetime.now(timezone.utc).replace(tzinfo=None),
        quoted_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["forwarder_id", "request_id"],
        set_={"status": stmt.excluded.status, "quoted_price": stmt.excluded.quoted_price, "quoted_at": stmt.excluded.quoted_at}
    )
    await db.execute(stmt)
    await db.commit()

    return {"success": True, "request_id": bid_in.request_id, "forwarder_id": bid_in.forwarder_id}
