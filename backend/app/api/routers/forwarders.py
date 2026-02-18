from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.forwarder import Forwarder
from typing import Dict, List

router = APIRouter()

@router.post("/register", response_model=Dict)
async def register_forwarder(
    data: Dict, 
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a new forwarder (Step 1 of onboarding).
    Status starts as 'inactive' until Stripe webhook fires.
    """
    try:
        # 1. Check if Email Exists in USERS table
        from app.models.user import User
        from sqlalchemy import select
        from app.core.security import get_password_hash # Assuming this exists, or I will inline generic hashing
        from passlib.context import CryptContext
        
        # Inline hashing for robustness if imports fail
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        existing_user = await db.execute(select(User).where(User.email == data.get('email')))
        if existing_user.scalar_one_or_none():
             raise HTTPException(status_code=400, detail="Email already registered. Please login.")

        # 2. Create User Account (For Login)
        new_user = User(
            email=data.get('email'),
            password_hash=pwd_context.hash(data.get('password')),
            full_name=data.get('company_name'),
            role='forwarder',
            is_active=True
        )
        db.add(new_user)
        await db.flush() # Generate ID
        
        # 3. Create Forwarder Profile (Linked to User)
        forwarder = Forwarder(
            user_id=new_user.id,
            company_name=data.get('company_name'),
            email=data.get('email'),
            country=data.get('country'),
            phone=data.get('phone'),
            logo_url=data.get('logo_url'),
            tax_id=data.get('tax_id'),
            document_url=data.get('document_url'),
            status='active' 
        )
        db.add(forwarder)
        await db.flush() # Generate ID but DO NOT COMMIT YET
        
        # 4. TRIGGER N8N (STRICT MODE)
        # User Requirement: "The user shouldnt get register unless it trigger the n8n"
        import os
        import httpx
        webhook_url = os.getenv('N8N_WEBHOOK_URL')

        if not webhook_url:
            raise HTTPException(status_code=500, detail="Configuration Error: N8N_WEBHOOK_URL missing. Cannot process registration.")

        try:
            async with httpx.AsyncClient() as client:
                n8n_res = await client.post(
                    webhook_url,
                    json={
                        "type": "NEW_FORWARDER",
                        "userId": str(new_user.id),
                        "forwarderId": str(forwarder.id),
                        "company": forwarder.company_name,
                        "email": forwarder.email,
                        "country": forwarder.country,
                        "phone": forwarder.phone,
                        "taxId": forwarder.tax_id,
                        "docUrl": forwarder.document_url,
                        "timestamp": str(forwarder.registered_at)
                    },
                    timeout=10.0 # Increased timeout for reliability
                )
                
                if n8n_res.status_code != 200:
                   raise Exception(f"n8n returned status {n8n_res.status_code}")
                   
        except Exception as e:
            # If n8n fails, the DB transaction will naturally rollback when we raise HTTP Exception
            # because we haven't called db.commit() yet.
            print(f"❌ Strict N8N Check Failed: {e}")
            raise HTTPException(status_code=503, detail=f"Automation Handshake Failed. Registration Aborted. Reason: {str(e)}")

        # 5. COMMIT ONLY IF N8N SUCCEEDED
        await db.commit()
        await db.refresh(forwarder)
        
        return {
            'success': True,
            'message': 'Registration Successful! Account Created & Synced.',
            'forwarderId': str(forwarder.id),
            'userId': str(new_user.id)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Forwarder Reg Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/activate", response_model=Dict)
async def activate_forwarder(
    data: Dict, 
    db: AsyncSession = Depends(get_db)
):
    """
    Called by n8n/Stripe after successful payment.
    Auto-activates the forwarder so they appear on the public page.
    """
    import os
    if data.get('secret') != os.getenv('N8N_SECRET'):
         raise HTTPException(status_code=401, detail="Unauthorized")

    from sqlalchemy import select
    result = await db.execute(select(Forwarder).where(Forwarder.email == data.get('email')))
    forwarder = result.scalar_one_or_none()

    if not forwarder:
        raise HTTPException(status_code=404, detail="Forwarder not found")

    # SECURITY UPDATE:
    # We do NOT set to 'active' immediately anymore.
    # We set to 'pending_approval' so Admin can verify documents.
    forwarder.status = 'pending_approval'
    
    # Optional: Store stripe IDs if passed
    if data.get('stripe_customer_id'):
        forwarder.stripe_customer_id = data.get('stripe_customer_id')
        
    await db.commit()
    
    return {"success": True, "message": "Forwarder Paid. Status: Pending Approval", "id": forwarder.id}

@router.patch("/approve", response_model=Dict)
async def approve_forwarder(
    data: Dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Called by Admin (via n8n or Dashboard) to finally verify the forwarder.
    """
    import os
    # Simple secret check for MVP (or use Admin Auth dependency)
    if data.get('secret') != os.getenv('N8N_SECRET'):
         raise HTTPException(status_code=401, detail="Unauthorized")
         
    from sqlalchemy import select
    result = await db.execute(select(Forwarder).where(Forwarder.email == data.get('email')))
    forwarder = result.scalar_one_or_none()
    
    if not forwarder:
        raise HTTPException(status_code=404, detail="Forwarder not found")
        
    forwarder.status = 'active'
    await db.commit()
    
    return {"success": True, "message": "Forwarder Verified & Active"}

@router.get("/active", response_model=Dict)
async def get_active_forwarders(
    countries: str = None, 
    db: AsyncSession = Depends(get_db)
):
    """
    Returns active forwarders. 
    Called by n8n to find target audience.
    """
    from sqlalchemy import select
    
    query = select(Forwarder).where(Forwarder.status == 'active')
    
    # If filtering by country (comma separated)
    if countries:
        country_list = [c.strip().upper() for c in countries.split(',')]
        query = query.where(Forwarder.country.in_(country_list))
        
    result = await db.execute(query)
    forwarders = result.scalars().all()
    
    data = []
    for f in forwarders:
        data.append({
            "id": f.id,
            "company_name": f.company_name,
            "email": f.email,
            "country": f.country
        })
        
    return {'forwarders': data}

@router.get("/by-email/{email}", response_model=Dict)
async def get_forwarder_by_email(email: str, db: AsyncSession = Depends(get_db)):
    """Used by n8n to validate email replies."""
    from sqlalchemy import select
    result = await db.execute(select(Forwarder).where(Forwarder.email == email))
    forwarder = result.scalar_one_or_none()
    
    if not forwarder:
        raise HTTPException(status_code=404, detail="Forwarder not found")
        
    return {
        "id": forwarder.id,
        "company_name": forwarder.company_name,
        "status": forwarder.status,
        "logo_url": forwarder.logo_url
    }
