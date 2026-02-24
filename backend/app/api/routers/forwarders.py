from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.user import User
from app.models.marketplace import MarketplaceBid, MarketplaceRequest
from app.api.deps import get_current_user
from sqlalchemy import select, func
from datetime import datetime, timedelta
from pydantic import BaseModel
import stripe
import os

router = APIRouter()

class ForwarderSave(BaseModel):
    company_name: str
    email: str
    phone: str = ""
    country: str = ""
    tax_id: str = ""
    website: str = ""
    document_url: str = ""
    logo_url: str = ""
    forwarder_id: str = ""  # n8n can pass this, or we auto-generate
    stripe_customer_id: str = ""
    status: str = "PENDING_REVIEW"
    is_verified: bool = False
    is_paid: bool = False

@router.post("/save")
async def save_forwarder(f_in: ForwarderSave, db: AsyncSession = Depends(get_db)):
    """
    Secure endpoint for n8n Cloud to save a verified/paid partner.
    Called after Stripe payment succeeds.
    """
    # Check if already exists (idempotent)
    existing = await db.execute(select(Forwarder).where(Forwarder.email == f_in.email))
    if existing.scalars().first():
        return {"success": True, "message": "Partner already exists. Record synchronized."}
    
    # Auto-generate forwarder_id if n8n didn't provide one
    fwd_id = f_in.forwarder_id
    if not fwd_id:
        count_result = await db.execute(select(func.count()).select_from(Forwarder))
        count = count_result.scalar() or 0
        fwd_id = f"F{str(count + 1).zfill(3)}"
        
    new_f = Forwarder(
        forwarder_id=fwd_id,
        company_name=f_in.company_name,
        email=f_in.email,
        phone=f_in.phone,
        website=f_in.website,
        country=f_in.country,
        tax_id=f_in.tax_id,
        document_url=f_in.document_url,
        logo_url=f_in.logo_url,
        stripe_customer_id=f_in.stripe_customer_id,
        status=f_in.status,
        is_verified=f_in.is_verified,
        is_paid=f_in.is_paid,
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    
    db.add(new_f)
    await db.commit()
    
    return {
        "success": True,
        "forwarder_id": fwd_id,
        "message": f"Partner {f_in.company_name} saved. ID: {fwd_id}"
    }

@router.put("/activate/{f_id}")
async def activate_forwarder(f_id: str, db: AsyncSession = Depends(get_db)):
    """
    Activates a forwarder after payment confirmation.
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
    Returns all verified OMEGO partners.
    """
    result = await db.execute(select(Forwarder).where(Forwarder.status == "ACTIVE"))
    forwarders = result.scalars().all()
    
    if not forwarders:
        return {
            "success": True,
            "forwarders": [],
            "message": "No active partners found."
        }
        
    return {
        "success": True,
        "forwarders": [
            {
                "id": f.id,
                "forwarder_id": f.forwarder_id,
                "company_name": f.company_name,
                "country": f.country,
                "email": f.email,
                "phone": f.phone,
                "website": f.website,
                "reliability_score": f.reliability_score,
                "logo_url": f.logo_url,
                "is_verified": f.is_verified,
                "expires_at": str(f.expires_at) if f.expires_at else None
            } for f in forwarders
        ]
    }

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

@router.get("/dashboard/{forwarder_id}")
async def forwarder_dashboard(forwarder_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns only the quotes submitted by this specific forwarder.
    """
    # 1. Verify existence
    f_stmt = select(Forwarder).where(Forwarder.forwarder_id == forwarder_id)
    f_res = await db.execute(f_stmt)
    f = f_res.scalars().first()
    if not f:
        raise HTTPException(status_code=404, detail="Forwarder not found")

    # 2. Get all bids submitted by this forwarder
    bids_stmt = select(MarketplaceBid).where(MarketplaceBid.forwarder_id == forwarder_id)
    bids_res = await db.execute(bids_stmt)
    bids = bids_res.scalars().all()
    
    total_quotes = len(bids)
    
    # 3. Get the full details of the requests they bid on
    quotes_data = []
    for b in bids:
        req_stmt = select(MarketplaceRequest).where(MarketplaceRequest.request_id == b.request_id)
        req_res = await db.execute(req_stmt)
        req = req_res.scalars().first()
        
        if req:
            quotes_data.append({
                "request_id": req.request_id,
                "cargo_type": req.cargo_type,
                "origin": req.origin_city,
                "destination": req.dest_city,
                "status": req.status,
                "your_price": b.price,
                "your_position": b.position,
                "submitted_at": str(b.created_at)
            })

    return {
        "success": True,
        "company_name": f.company_name,
        "metrics": {
            "total_quotes_submitted": total_quotes,
            "active_bids": len([q for q in quotes_data if q["status"] == "OPEN"]),
            "won_bids": len([q for q in quotes_data if q["your_position"] == 1]) # Rough proxy for now
        },
        "quotes": quotes_data
    }

@router.post("/upgrade-id")
async def upgrade_user_id(
    email: str, 
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upgrades a normal user to REG-OMEGO after securely verifying Stripe payment.
    """
    if current_user.email != email:
        raise HTTPException(status_code=403, detail="Unauthorized upgrade.")
        
    try:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
        session = stripe.checkout.sessions.retrieve(session_id)
        if session.payment_status != 'paid':
            raise HTTPException(status_code=400, detail="Payment pending or failed.")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid session token.")

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not db_user.sovereign_id.startswith("REG-"):
        db_user.sovereign_id = "REG-" + db_user.sovereign_id
        db_user.role = "forwarder"
        await db.commit()
        
    return {"success": True, "new_id": db_user.sovereign_id}
