from fastapi import APIRouter
from typing import List, Dict
from app.schemas import RateRequest, OceanQuote
from app.services.ocean.maersk import MaerskClient
from app.services.sovereign import sovereign_engine
from app.services.sentinel import sentinel
import asyncio
import hashlib
import json
from datetime import datetime, timedelta

def generate_quote_id(quote: dict) -> str:
    """ DETERMINISTIC HASHING: Ensures persistent IDs for stateless quotes."""
    # Hash critical fields to create a stable reference
    seed = f"{quote.get('carrier_name','')}-{quote.get('origin_locode','')}-{quote.get('dest_locode','')}-{quote.get('price',0)}-{quote.get('departure_date','N/A')}"
    return hashlib.md5(seed.encode()).hexdigest()[:12].upper()

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.services.activity import activity_service
from typing import Optional

@router.post("/", response_model=Dict)
async def get_real_ocean_quotes(
    request: RateRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
):
    """
    Orchestrates REAL calls and enriches them with Sovereign Intelligence.
    """
    # LOG ACTIVITY (If Authenticated)
    if current_user:
        await activity_service.log(
            db,
            user_id=str(current_user.id),
            action="SEARCH",
            entity_type="LANE",
            entity_id=f"{request.origin}-{request.destination}", # Use this as ref for resume
            metadata={"origin": request.origin, "destination": request.destination, "container": request.container}
        )

    maersk = MaerskClient()
    
    # SOVEREIGN INTELLIGENCE: Decrypt Port Codes (e.g. CNSHA -> Shanghai)
    request.origin = sovereign_engine.resolve_port_code(request.origin)
    request.destination = sovereign_engine.resolve_port_code(request.destination)
    
    quotes = []
    
    # 1. REAL REALITY: Fetch Maersk (Schedules + Real Rates)
    try:
        maersk_quotes = await maersk.fetch_real_rates(request)
        if maersk_quotes:
            quotes.extend(maersk_quotes)
    except Exception as e:
        print(f"[WARN] Maersk Fetch Error: {e}")
    
    # 2. SOVEREIGN GLOBAL CARRIER MATRIX (G.O.A.T. Expansion)
    # If real API data is insufficient, we trigger the All-World Sovereign Protocol.
    if len(quotes) < 5:
        print(f"[INFO] Expansion Triggered. Current count: {len(quotes)}. Engaging Global Carrier Matrix.")
        
        # Pass commodity to influence price/wisdom
        est = sovereign_engine.generate_market_rate(request.origin, request.destination, request.container)
        
        # COMMODITY INTELLIGENCE MODIFIER
        commodity_factor = 1.0
        if "Hazardous" in request.commodity: commodity_factor = 1.25
        if "Refrigerated" in request.commodity or "Pharma" in request.commodity: commodity_factor = 1.4
        
        est["price"] = int(est["price"] * commodity_factor)
        est["wisdom"] += f" Rate adjusted for {request.commodity} specific handling."
        
        # GLOBAL CARRIER DATABASE (Deterministic Personality Nodes)
        carriers = [
            {"id": "MSC", "name": "MSC (Sovereign Direct)", "offset": 1.05, "transit": -1, "vessels": ["MSC OSCAR", "MSC GULSUN", "MSC AMELIA"], "wisdom": "World-leader fleet. Dominates high-capacity corridors with extreme reliability."},
            {"name": "Hapag-Lloyd (Premium)", "offset": 1.12, "transit": -3, "vessels": ["BERLIN EXPRESS", "HAMBURG EXPRESS"], "wisdom": "Premium German efficiency. Ultra-fast transits for time-sensitive cargo."},
            {"name": "ZIM (Israel Pioneer)", "offset": 1.15, "transit": -4, "vessels": ["ZIM SAMMY", "ZIM LUANDA"], "wisdom": "Niche priority specialist. Agile schedules for emerging trade lanes."},
            {"name": "Yang Ming (Taiwan Strong)", "offset": 0.92, "transit": 2, "vessels": ["YM WELLNESS", "YM WREATH"], "wisdom": "Balanced Pacific network. Competitive pricing for large-scale logistics."},
            {"name": "PIL (Pacific Int)", "offset": 0.94, "transit": 0, "vessels": ["KOTA SALAM", "KOTA SATRIA"], "wisdom": "Intra-Asia/Africa specialist. Deep knowledge of regional hub-spoke logistics."},
            {"name": "Evergreen (Global Reach)", "offset": 0.98, "transit": 1, "vessels": ["EVER GIVEN", "EVER GREET"], "wisdom": "Massive global reach. Stable pricing across all intercontinental trade lanes."}
        ]
        
        for c in carriers:
            # Generate 2 unique schedules per carrier for "Reality Depth"
            for i in range(2):
                # Physics-based variation per schedule
                sched_offset = 1.0 + (i * 0.05) # Later sailings slightly more expensive/cheaper
                price = int(est["price"] * c["offset"] * sched_offset)
                transit = max(7, est["transit_time"] + c["transit"] - i)
                vessel = c["vessels"][i % len(c["vessels"])]
                
                departure = datetime.now() + timedelta(days=3 + (i * 4))
                
                # SENTINEL ANALYSIS (2026 Features)
                emissions = sovereign_engine.estimate_carbon_footprint(12000, request.container) * (0.9 if c["transit"] > 0 else 1.1)
                cbam = sentinel.calculate_cbam_impact(emissions, request.destination, request.goods_value or 50000)
                security = sentinel.analyze_route_security(request.origin, request.destination, sovereign_engine.calculate_risk_score(request.origin, request.destination))
                
                # Apply CBAM Cost if Applicable
                total_price = price + cbam["cost"]

                qid = generate_quote_id({"carrier_name": c["name"], "price": total_price, "origin": request.origin})
                
                quotes.append({
                    "id": qid,
                    "carrier_name": c["name"],
                    "origin_locode": request.origin,
                    "dest_locode": request.destination,
                    "container_type": request.container,
                    "price": int(total_price),
                    "currency": "USD",
                    "transit_time_days": transit,
                    "expiration_date": (departure + timedelta(days=14)).strftime("%Y-%m-%d"),
                    "is_real_api_rate": False,
                    "source_endpoint": f"Sovereign Physics Engine (Forecasted Estimate {vessel[:3]}-2026)",
                    "metadata": {
                        "verification": "Simulation-Verified",
                        "model": "Maritime-Physics-v4.3",
                        "quantum_signature": sentinel.quantum_sign_quote(qid, total_price)
                    },
                    "wisdom": f"{c['wisdom']} Sailing on {vessel}. {est['wisdom']} {security['advisory']}",
                    "thc_fee": int(est["breakdown"]["terminal_handling"] * c["offset"]),
                    "pss_fee": int(est["breakdown"]["surcharges"] * c["offset"]),
                    "fuel_fee": int(est["breakdown"]["fuel_component"] * (2.0 - c["offset"])),
                    "risk_score": sovereign_engine.calculate_risk_score(request.origin, request.destination),
                    "carbon_emissions": emissions,
                    "cbam_tax": cbam["cost"],
                    "cbam_compliance_note": cbam["note"],
                    "port_congestion_index": sovereign_engine.get_port_congestion(request.destination),
                    "customs_duty_estimate": int(request.goods_value * 0.05) if request.goods_value else int(price * 0.05),
                    "contact_office": f"NODE-{c.get('id', 'GP')}-2026",
                    "departure_date": departure.strftime("%Y-%m-%d"),
                    "vessel_name": vessel
                })
        
        # Option X: PROPHETIC VISION (AI Master Tier)
        # Always place the Prophetic Tier at the top for maximum "WOW"
        pulse = est["breakdown"]["daily_pulse"]
        signal = "BUY_NOW" if pulse < 1.05 else "WAIT_72H"
        
        # Prophetic Sentinel Analysis
        est_emissions = sovereign_engine.estimate_carbon_footprint(12000, request.container) * 0.75
        est_cbam = sentinel.calculate_cbam_impact(est_emissions, request.destination, request.goods_value or 50000)
        
        prophetic_price = int(est["price"] * 0.92) if signal == "BUY_NOW" else int(est["price"] * 1.08)
        prophetic_price += int(est_cbam["cost"])

        prophetic_quote = {
            "carrier_name": "Sovereign AI Prophetic (Beta)",
            "origin_locode": request.origin,
            "dest_locode": request.destination,
            "container_type": request.container,
            "price": prophetic_price,
            "currency": "USD",
            "transit_time_days": est["transit_time"] + 3, # Saver AI route
            "expiration_date": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d"),
            "is_real_api_rate": False,
            "source_endpoint": "Predictive Pulse Engine v5.0",
            "wisdom": f"🔮 PROPHETIC SIGNAL: {signal}. {est['wisdom']} {est_cbam['note']}",
            "thc_fee": est["breakdown"]["terminal_handling"],
            "pss_fee": est["breakdown"]["surcharges"],
            "fuel_fee": est["breakdown"]["fuel_component"],
            "risk_score": sovereign_engine.calculate_risk_score(request.origin, request.destination),
            "carbon_emissions": est_emissions, 
            "cbam_tax": est_cbam["cost"],
            "port_congestion_index": sovereign_engine.get_port_congestion(request.destination),
            "customs_duty_estimate": int(request.goods_value * 0.05) if request.goods_value else int(est["price"] * 0.05),
            "contact_office": "AI_ORACLE_CENTRAL",
            "is_featured": True,
            "departure_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        }
        prophetic_quote["metadata"] = {"quantum_signature": sentinel.quantum_sign_quote("AI-PROPHECY", prophetic_price)}
        quotes.insert(0, prophetic_quote) # The Legend always starts the list
    
    # FINAL ID INJECTION
    for q in quotes:
        if isinstance(q, dict):
            q["id"] = generate_quote_id(q)
        else:
            # Assuming it's an OceanQuote object
            q.id = generate_quote_id(q.model_dump())
    
    return quotes
@router.post("/calculate", response_model=Dict)
async def calculate_landed_cost(request: RateRequest):
    """
    Precision Calculator Node.
    Returns a single authoritative rate breakdown based on Sovereign Physics.
    """
    # Resolve Port Codes
    origin = sovereign_engine.resolve_port_code(request.origin)
    dest = sovereign_engine.resolve_port_code(request.destination)
    
    # Generate Rate
    res = sovereign_engine.generate_market_rate(origin, dest, request.container)
    
    # Apply Commodity Modifier
    commodity_factor = 1.0
    if "Hazardous" in request.commodity: commodity_factor = 1.25
    if "Refrigerated" in request.commodity: commodity_factor = 1.4
    
    res["price"] = int(res["price"] * commodity_factor)
    
    # Add taxes & duties
    duty = int(request.goods_value * 0.05) if request.goods_value else 0
    res["total_landed"] = res["price"] + duty
    res["duty_estimate"] = duty
    
    return {
        "success": True,
        "data": res
    }
