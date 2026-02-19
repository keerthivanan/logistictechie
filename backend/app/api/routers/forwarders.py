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
        logo_url=f_in.logo_url
    )
    
    db.add(new_f)
    await db.commit()
    
    return {"success": True, "message": "Onboarding Complete."}

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
                "reliability_score": f.reliability_score,
                "logo_url": f.logo_url,
                "is_verified": f.is_verified
            } for f in forwarders
        ]
    }
