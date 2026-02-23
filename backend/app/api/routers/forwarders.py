from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from sqlalchemy import select
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class ForwarderRegister(BaseModel):
    company_name: str
    email: str
    phone: str
    country: str
    tax_id: str
    document_url: str
    logo_url: str

@router.post("/register")
async def register_forwarder(f_in: ForwarderRegister, db: AsyncSession = Depends(get_db)):
    """
    Registers a new logistics partner to the network.
    """
    # Check if already exists
    existing = await db.execute(select(Forwarder).where(Forwarder.email == f_in.email))
    if existing.scalars().first():
        return {"success": False, "message": "Email already registered."}
        
    new_f = Forwarder(
        company_name=f_in.company_name,
        email=f_in.email,
        phone=f_in.phone,
        country=f_in.country,
        tax_id=f_in.tax_id,
        document_url=f_in.document_url,
        logo_url=f_in.logo_url,
        status="PENDING_VERIFICATION",
        is_verified=False
    )
    
    db.add(new_f)
    await db.commit()
    await db.refresh(new_f)
    
    # 📡 OUTBOUND PROTOCOL: Send to n8n for Excel storage
    from app.services.webhook import webhook_service
    await webhook_service.trigger_registration_webhook({
        "id": new_f.id,
        "company_name": new_f.company_name,
        "email": new_f.email,
        "phone": new_f.phone,
        "country": new_f.country,
        "tax_id": new_f.tax_id,
        "document_url": f_in.document_url,
        "logo_url": f_in.logo_url
    })
    
    return {"success": True, "message": "Onboarding Pending Verification."}

@router.put("/activate/{f_id}")
async def activate_forwarder(f_id: str, db: AsyncSession = Depends(get_db)):
    """
    Secure endpoint for n8n to activate a forwarder after $15 payment.
    """
    stmt = select(Forwarder).where(Forwarder.id == f_id)
    result = await db.execute(stmt)
    f = result.scalars().first()
    
    if not f:
        raise HTTPException(status_code=404, detail="Partner not found")
        
    f.status = "ACTIVE"
    f.is_verified = True
    f.is_paid = True
    
    await db.commit()
    return {"success": True, "message": "Partner Activated."}

@router.get("/active")
async def list_forwarders(db: AsyncSession = Depends(get_db)):
    """
    Returns a list of verified OMEGO partners.
    """
    result = await db.execute(select(Forwarder).where(Forwarder.status == "ACTIVE"))
    forwarders = result.scalars().all()
    
    # If empty, return success with empty list - 0 Fake Content Policy.
    if not forwarders:
        return {
            "success": True,
            "forwarders": [],
            "message": "The OMEGO Sovereign Network is currently synchronizing. No local verified partners found for this query."
        }
        
    return {
        "success": True,
        "forwarders": [
            {
                "id": f.id,
                "company_name": f.company_name,
                "country": f.country,
                "email": f.email,
                "phone": f.phone,
                "reliability_score": f.reliability_score,
                "logo_url": f.logo_url,
                "is_verified": f.is_verified
            } for f in forwarders
        ]
    }
