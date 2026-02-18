from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.marketplace import ShipmentRequest, MarketplaceQuote
from app.api import deps
from pydantic import BaseModel
from typing import Optional, Dict, List
import httpx
import os
from datetime import datetime

router = APIRouter()

# --- UTILS ---
async def generate_unique_id(db: AsyncSession) -> str:
    """Generates SHP-00001 style ID."""
    try:
        # Use execute for raw count query or safer SA count
        from sqlalchemy import select, func
        result = await db.execute(select(func.count()).select_from(ShipmentRequest))
        count = result.scalar() + 1
        return f"SHP-{str(count).zfill(5)}"
    except Exception as e:
        print(f"Error generating ID: {e}")
        return f"SHP-{int(datetime.utcnow().timestamp())}"

# --- ENDPOINTS ---

@router.post("/submit", response_model=Dict)
async def submit_request(
    data: Dict, 
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a new shipment request and triggers n8n webhook.
    """
    try:
        # 1. Generate ID
        unique_id = await generate_unique_id(db)
        
        # 2. Prepare Object (But DO NOT COMMIT)
        shipment = ShipmentRequest(
            unique_id=unique_id,
            user_id=data.get('user_id'),
            origin_city=data.get('origin_city'),
            origin_country=data.get('origin_country'),
            dest_city=data.get('dest_city'),
            dest_country=data.get('dest_country'),
            cargo_type=data.get('cargo_type'),
            weight_kg=data.get('weight_kg'),
            volume_cbm=data.get('volume_cbm'),
            cargo_value=data.get('cargo_value'),
            incoterms=data.get('incoterms'),
            notes=data.get('notes'),
            raw_input=data.get('raw_input'),
            status='open',
            quotes_count=0
        )
        db.add(shipment)
        await db.flush() # Get ID
        
        # 3. STRICT MODE: Fire n8n Webhook (Optional Fallback for Demo)
        webhook_url = os.getenv('N8N_WEBHOOK_URL')
        if not webhook_url:
            print("[INFO] n8n Webhook URL missing. Skipping automation bridge and committing locally.")
        else:
            try:
                async with httpx.AsyncClient() as client:
                    n8n_res = await client.post(
                        webhook_url,
                        json={
                            'type': 'NEW_SHIPMENT',
                            'shipmentId': str(shipment.id),
                            'uniqueId': unique_id,
                            'userId': str(data.get('user_id')),
                            'originCity': data.get('origin_city'),
                            'originCountry': data.get('origin_country'),
                            'destCity': data.get('dest_city'),
                            'destCountry': data.get('dest_country'),
                            'cargoType': data.get('cargo_type'),
                            'weightKg': data.get('weight_kg'),
                            'volumeCbm': data.get('volume_cbm'),
                            'cargoValue': data.get('cargo_value'),
                            'incoterms': data.get('incoterms'),
                            'notes': data.get('notes'),
                            'rawInput': data.get('raw_input')
                        },
                        timeout=8.0
                    )
                    
                    if n8n_res.status_code != 200:
                        print(f"[WARN] Automation Server rejected request (Status {n8n_res.status_code})")
            except Exception as e:
                print(f"[WARN] n8n Handshake Failed: {e}. Proceeding with local commit.")
        
        # 4. Success -> Commit
        await db.commit()
        await db.refresh(shipment)
        
        return {
            'success': True,
            'uniqueId': unique_id,
            'shipmentId': str(shipment.id),
            'message': 'Request submitted & broadcasted to network.'
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Submit Request Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quote-received", response_model=Dict)
async def quote_received(
    data: Dict, 
    db: AsyncSession = Depends(get_db)
):
    """
    Called by n8n when a valid quote is parsed.
    """
    secret = data.get('secret')
    if secret != os.getenv('N8N_SECRET'):
        raise HTTPException(status_code=401, detail="Invalid n8n secret")
        
    unique_id = data.get('uniqueId')
    if not unique_id:
        raise HTTPException(status_code=400, detail="Missing uniqueId")
        
    # Get shipment
    from sqlalchemy import select
    result = await db.execute(select(ShipmentRequest).where(ShipmentRequest.unique_id == unique_id))
    shipment = result.scalar_one_or_none()
    
    if not shipment:
        return {'accepted': False, 'reason': 'not found'}
    
    # ATOMIC CHECK: quotes < 3
    if shipment.quotes_count >= 3 or shipment.status == 'closed':
        return {
            'accepted': False, 
            'reason': 'closed', 
            'message': f'{unique_id} is CLOSED. 3 quotes received.'
        }
        
    # Increment Count
    shipment.quotes_count += 1
    new_count = shipment.quotes_count
    
    if new_count >= 3:
        shipment.status = 'closed'
        shipment.closed_at = datetime.utcnow()
        
    await db.commit()
    
    # Save Quote
    quote = MarketplaceQuote(
        shipment_id=shipment.id,
        forwarder_id=data.get('forwarderId'),
        price=data.get('price'),
        currency=data.get('currency', 'USD'),
        transit_days=data.get('transitDays'),
        mode=data.get('mode'),
        terms=data.get('terms'),
        validity_days=data.get('validityDays', 7),
        notes=data.get('notes'),
        raw_reply=data.get('rawReply'),
        position=new_count
    )
    db.add(quote)
    await db.commit()
    
    return {
        'accepted': True,
        'position': new_count,
        'isNowClosed': new_count >= 3
    }

@router.get("/quotes/{unique_id}", response_model=Dict)
async def get_quotes(
    unique_id: str, 
    db: AsyncSession = Depends(get_db)
):
    """
    Returns quotes for dashboard.
    Joins with Forwarder table to get company info.
    """
    from sqlalchemy import text
    
    # Using Raw SQL for easy JOIN per user instruction or SQLAlchemy Core
    # User's snippet used raw SQL string. I'll use text() for safety but keep logic.
    stmt = text("""
        SELECT 
            mq.id, mq.price, mq.currency, mq.transit_days, mq.mode, mq.notes, mq.position,
            f.company_name, f.logo_url, f.country
        FROM marketplace_quotes mq
        JOIN forwarders f ON f.id = mq.forwarder_id
        JOIN shipment_requests sr ON sr.id = mq.shipment_id
        WHERE sr.unique_id = :unique_id
        ORDER BY mq.position ASC
    """)
    
    result = await db.execute(stmt, {"unique_id": unique_id})
    rows = result.fetchall()
    
    quotes = []
    for row in rows:
        quotes.append({
            "id": row.id,
            "price": row.price,
            "currency": row.currency,
            "transit_days": row.transit_days,
            "mode": row.mode,
            "notes": row.notes,
            "position": row.position,
            "company_name": row.company_name,
            "logo_url": row.logo_url,
            "country": row.country
        })
        
    return {'quotes': quotes}

@router.get("/leads", response_model=Dict)
async def get_open_leads(
    origin_country: str = None,
    dest_country: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns OPEN shipment requests for Forwarders (Smart Matching).
    """
    from sqlalchemy import select, desc
    
    query = select(ShipmentRequest).where(ShipmentRequest.status == 'open')
    
    # Optional Filters
    if origin_country:
        query = query.where(ShipmentRequest.origin_country == origin_country.upper())
    if dest_country:
        query = query.where(ShipmentRequest.dest_country == dest_country.upper())
        
    # Newest first
    query = query.order_by(desc(ShipmentRequest.created_at))
    
    result = await db.execute(query)
    shipments = result.scalars().all()
    
    data = []
    for s in shipments:
        data.append({
            "id": s.id,
            "unique_id": s.unique_id,
            "origin": f"{s.origin_city}, {s.origin_country}",
            "destination": f"{s.dest_city}, {s.dest_country}",
            "cargo": s.cargo_type,
            "weight": s.weight_kg,
            "created_at": s.created_at
        })
        
    return {'leads': data}

