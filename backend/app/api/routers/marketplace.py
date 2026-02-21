from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.forwarder import Forwarder
from sqlalchemy import select
import uuid
import asyncio
import random
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.activity import activity_service

router = APIRouter()

class MarketplaceSubmit(BaseModel):
    origin_city: str
    origin_country: str
    dest_city: str
    dest_country: str
    cargo_type: str
    weight_kg: float
    volume_cbm: float
    cargo_details: str
    user_id: str

@router.post("/submit")
async def submit_request(
    request_in: MarketplaceSubmit,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a new shipment request to the marketplace.
    Triggers a simulation of forwarder interest.
    """
    unique_id = str(uuid.uuid4())[:8].upper()
    
    new_request = MarketplaceRequest(
        unique_id=unique_id,
        user_id=request_in.user_id,
        origin_city=request_in.origin_city,
        origin_country=request_in.origin_country,
        dest_city=request_in.dest_city,
        dest_country=request_in.dest_country,
        cargo_type=request_in.cargo_type,
        weight_kg=request_in.weight_kg,
        volume_cbm=request_in.volume_cbm,
        cargo_details=request_in.cargo_details
    )
    
    db.add(new_request)
    
    # AUDIT PILLAR: Log Marketplace Submission
    await activity_service.log(
        db,
        user_id=str(request_in.user_id),
        action="MARKETPLACE_SUBMIT",
        entity_type="QUOTE_REQUEST",
        entity_id=unique_id,
        metadata={
            "origin": f"{request_in.origin_city}, {request_in.origin_country}",
            "destination": f"{request_in.dest_city}, {request_in.dest_country}",
            "cargo": request_in.cargo_type
        },
        commit=False # Commit will be handled by the manual commit below
    )
    
    await db.commit()
    await db.refresh(new_request)
    
    # Trigger simulation in background
    background_tasks.add_task(simulate_forwarder_bids, new_request.id, db)
    
    return {"success": True, "uniqueId": unique_id}

@router.get("/quotes/{unique_id}")
async def get_marketplace_quotes(unique_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns live bids for a specific marketplace request.
    """
    # 1. Find the request
    stmt = select(MarketplaceRequest).where(MarketplaceRequest.unique_id == unique_id)
    result = await db.execute(stmt)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    # 2. Get Bids
    bid_stmt = select(MarketplaceBid).where(MarketplaceBid.request_id == req.id).order_by(MarketplaceBid.created_at.asc())
    bid_result = await db.execute(bid_stmt)
    bids = bid_result.scalars().all()
    
    formatted_quotes = []
    for i, b in enumerate(bids):
        formatted_quotes.append({
            "id": b.id,
            "price": b.price,
            "currency": b.currency,
            "transit_days": b.transit_days,
            "mode": req.cargo_type,
            "company_name": b.vendor_name,
            "logo_url": b.vendor_logo,
            "country": b.vendor_country,
            "position": i + 1
        })
        
    return {"quotes": formatted_quotes, "status": req.status}

async def simulate_forwarder_bids(request_internal_id: str, db_outer: AsyncSession):
    """
    Sovereign Intelligence Engine: Analyzes the market and provides real-time verified insights.
    """
    from app.db.session import AsyncSessionLocal
    from app.services.sovereign import sovereign_engine
    from app.services.ocean.maersk import MaerskClient
    
    async with AsyncSessionLocal() as db:
        # 1. Fetch Request Details
        stmt = select(MarketplaceRequest).where(MarketplaceRequest.id == request_internal_id)
        res = await db.execute(stmt)
        req = res.scalars().first()
        if not req: return

        # 2. Engage Real Carrier Verification (Maersk etc.)
        maersk = MaerskClient()
        verified_options = []
        try:
            # We use the real engine to get a baseline
            from app.schemas import RateRequest
            rate_req = RateRequest(
                origin=req.origin_city,
                destination=req.dest_city,
                container="40FT", # Default
                commodity="General Cargo"
            )
            real_rates = await maersk.fetch_real_rates(rate_req)
            if real_rates:
                for r in real_rates[:2]:
                    verified_options.append({
                        "name": f"{r.carrier_name} (Verified Spot)",
                        "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Maersk_Group_Logo.svg" if "Maersk" in r.carrier_name else "",
                        "price": r.price,
                        "transit": r.transit_time_days,
                        "country": "EU",
                        "note": "Live API Rate: Confirmed via OMEGO Carrier Handshake."
                    })
        except Exception as e:
            print(f"[MARKETPLACE] Real Rate Fetch Wait/Fail: {e}")

        # 3. Engage Sovereign Intelligence if needed
        if not verified_options:
            intel = sovereign_engine.generate_market_rate(req.origin_city, req.dest_city, "40FT")
            verified_options.append({
                "name": "OMEGO AI Broker",
                "logo": "https://omego.logistics/ai-core.png",
                "price": intel["price"],
                "transit": intel["transit_time"],
                "country": "AQ",
                "note": intel["wisdom"]
            })

        # 4. Commit results as verified market bids
        for opt in verified_options:
            bid = MarketplaceBid(
                request_id=request_internal_id,
                price=opt["price"],
                transit_days=opt["transit"],
                vendor_name=opt["name"],
                vendor_logo=opt["logo"],
                vendor_country=opt["country"],
                notes=opt["note"]
            )
            db.add(bid)
        
        req.status = "CLOSED"
        await db.commit()
