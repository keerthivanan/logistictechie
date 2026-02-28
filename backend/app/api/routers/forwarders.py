from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.user import User
from app.models.marketplace import MarketplaceBid, MarketplaceRequest, ForwarderBidStatus
from app.api.deps import get_current_user
from sqlalchemy import select, func
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.services.activity import activity_service
import os

router = APIRouter()

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
    status: str = "PENDING"
    is_verified: bool = False
    is_paid: bool = False

@router.post("/save")
async def save_forwarder(f_in: ForwarderSave, db: AsyncSession = Depends(get_db)):
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
        fwd_id = f"F{str(count + 1).zfill(3)}"
        
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
        registered_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30)
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
async def activate_forwarder(f_id: str, db: AsyncSession = Depends(get_db)):
    """
    Activates a forwarder after verification confirmation.
    """
    stmt = select(Forwarder).where(Forwarder.id == f_id)
    result = await db.execute(stmt)
    f = result.scalars().first()
    
    if not f:
        raise HTTPException(status_code=404, detail="Partner not found")
        
    f.status = "ACTIVE"
    f.is_verified = True
    f.is_paid = True
    f.expires_at = datetime.utcnow() + timedelta(days=30)
    
    await db.commit()
    return {"success": True, "message": "Partner Activated."}

@router.get("/active")
async def list_forwarders(db: AsyncSession = Depends(get_db)):
    """
    Returns all verified OMEGO partners as a flat JSON array for n8n compatibility.
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

class LoginRequest(BaseModel):
    forwarder_id: str
    email: str

@router.post("/auth")
async def forwarder_auth(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Secure passwordless login for forwarders using their assigned ID + Email combo.
    """
    stmt = select(Forwarder).where(
        Forwarder.forwarder_id == req.forwarder_id,
        Forwarder.email == req.email,
        Forwarder.status == "ACTIVE"
    )
    result = await db.execute(stmt)
    f = result.scalars().first()
    
    if not f:
        raise HTTPException(status_code=401, detail="Invalid Forwarder ID or Email")
        
    return {
        "success": True,
        "forwarder": {
            "id": f.forwarder_id,
            "company_name": f.company_name,
            "email": f.email
        }
    }


@router.post("/promote")
async def promote_user_to_partner(
    f_in: ForwarderSave,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    SOVEREIGN PROMOTION PROTOCOL (FREE TRIAL PHASE)
    Upgrades a normal user to a Registered Forwarder (REG-OMEGO).
    No payment required during the startup phase.
    """
    # 1. Fetch the user to be promoted
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Check if already promoted in User table
    if user.role == "forwarder" or user.sovereign_id.startswith("REG-"):
        # Even if user says they are forwarder, ensure they have a record in Forwarder table
        f_stmt = select(Forwarder).where(Forwarder.email == user.email)
        f_res = await db.execute(f_stmt)
        if f_res.scalars().first():
            return {"success": True, "message": "User is already an active partner.", "id": user.sovereign_id}

    # 2b. Check if email already exists in Forwarder table (Idempotency)
    f_stmt = select(Forwarder).where(Forwarder.email == user.email)
    f_res = await db.execute(f_stmt)
    existing_f = f_res.scalars().first()
    
    if existing_f:
        # Just update the User role and ID sync if forwarder record exists
        user.role = "forwarder"
        if not user.sovereign_id.startswith("REG-"):
            user.sovereign_id = f"REG-{user.sovereign_id}"
        await db.commit()
        return {"success": True, "message": "Partner profile re-linked.", "id": user.sovereign_id}

    # 3. Perform the Transformation
    old_id = user.sovereign_id
    new_id = f"REG-{old_id}"
    
    user.sovereign_id = new_id
    user.role = "forwarder"
    user.company_name = f_in.company_name
    user.company_email = f_in.company_email
    user.website = f_in.website
    user.phone_number = f_in.phone
    user.avatar_url = f_in.logo_url
    user.email = f_in.email
    
    # 4. Create the Forwarder Profile Record
    # This allows them to appear in the active bidder list (WF1 matching)
    forwarder_record = Forwarder(
        forwarder_id=new_id,
        company_name=f_in.company_name,
        contact_person=user.full_name,
        email=user.email,
        phone=f_in.phone,
        whatsapp=f_in.whatsapp,
        country=f_in.country,
        specializations=f_in.specializations,
        routes=f_in.routes,
        tax_id=f_in.tax_id,
        company_email=f_in.company_email,
        document_url=f_in.document_url,
        logo_url=f_in.logo_url,
        status="ACTIVE",
        is_verified=True,
        is_paid=True, # Free trial auto-paid status
        registered_at=datetime.utcnow(),
        activated_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=90) # 90-day extended startup trial
    )
    
    db.add(forwarder_record)
    
    # 5. Log the Promotion
    await activity_service.log(
        db,
        user_id=str(user.id),
        action="PARTNER_PROMOTION",
        entity_type="USER",
        entity_id=str(user.id),
        metadata={"detail": f"Upgraded {old_id} to {new_id} (Startup Trial)"},
        commit=False
    )
    
    # 6. TRIGGER THE BRAIN (n8n Sync)
    # This ensures the Google Sheet (USERS and REGISTERED_FORWARDERS) is updated.
    from app.services.webhook import webhook_service
    await webhook_service.trigger_registration_webhook({
        "event": "PARTNER_PROMOTION",
        "user_id": str(user.id),
        "old_sovereign_id": old_id,
        "new_sovereign_id": new_id,
        "email": user.email,
        "company_name": f_in.company_name,
        "phone": f_in.phone,
        "country": f_in.country
    })
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "new_id": new_id,
        "message": f"Sovereign Handshake Complete. You are now a Registered Partner."
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

    # 3. Fetch Metrics (Mocked for now, will connect to real bid history)
    # Total Bids
    bid_count_stmt = select(func.count(ForwarderBidStatus.id)).where(ForwarderBidStatus.forwarder_id == f_id)
    bid_count_res = await db.execute(bid_count_stmt)
    total_bids = bid_count_res.scalar() or 0

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
            "your_position": 1 # Placeholder for logic
        })

    return {
        "company_name": fwd.company_name,
        "metrics": {
            "total_quotes_submitted": total_bids,
            "active_bids": total_bids, # Placeholder
            "won_bids": 0, # Placeholder
            "reliability_score": fwd.reliability_score
        },
        "quotes": bids
    }
