from fastapi import APIRouter, Depends, Request, HTTPException
from typing import List, Dict
from app.schemas import RateRequest, OceanQuote
from app.models.quote import Quote
from app.services.ocean.maersk import MaerskClient
from app.services.sovereign import sovereign_engine, SovereignEngine
from app.services.sentinel import sentinel
import asyncio
import hashlib
import json
from datetime import datetime, timedelta

def generate_quote_id(quote: dict) -> str:
    """ DETERMINISTIC HASHING: Ensures persistent IDs for stateless quotes."""
    seed = f"{quote.get('carrier_name','')}-{quote.get('origin_locode','')}-{quote.get('dest_locode','')}-{quote.get('price',0)}-{quote.get('departure_date','N/A')}"
    return hashlib.md5(seed.encode()).hexdigest()[:12].upper()

router = APIRouter()

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
    
    # --- ROUTE VALIDATION GATE ---
    # 1. Same-city rejection
    def normalize_city(name: str) -> str:
        import re
        city = name.upper().strip().split(",")[0].strip()
        city = re.sub(r'^(ENNORE|PORT OF|PORT|NEW|OLD|NORTH|SOUTH|EAST|WEST|GREATER|INNER|OUTER)\s+', '', city)
        city = re.sub(r'\s+(PORT|HARBOUR|HARBOR|TERMINAL|DOCK|CITY|TOWN)$', '', city)
        return re.sub(r'\s+', '', city)
    
    norm_o = normalize_city(request.origin)
    norm_d = normalize_city(request.destination)
    
    if norm_o == norm_d or norm_o in norm_d or norm_d in norm_o:
        raise HTTPException(
            status_code=400,
            detail=f"Origin and destination resolve to the same location: '{request.origin}' ≈ '{request.destination}'. Please select different ports."
        )
    
    # 2. Distance validation
    route_distance = SovereignEngine.get_route_distance(request.origin, request.destination)
    
    if route_distance < 100:
        raise HTTPException(
            status_code=400,
            detail=f"Route too short ({route_distance}km). '{request.origin}' and '{request.destination}' are in the same metro area. Ocean freight is not applicable."
        )
    
    if route_distance < 500:
        raise HTTPException(
            status_code=400,
            detail=f"Route distance is only {route_distance}km between '{request.origin}' and '{request.destination}'. This is too short for ocean container shipping. Consider road or rail transport."
        )
    
    quotes = []
    
    # 1. REAL REALITY: Fetch Maersk (Schedules + Real Rates)
    try:
        maersk_quotes = await maersk.fetch_real_rates(request)
        if maersk_quotes:
            quotes.extend(maersk_quotes)
    except Exception as e:
        print(f"[WARN] Maersk Fetch Error: {e}")
    
    # 2. SOVEREIGN GLOBAL CARRIER MATRIX
    if len(quotes) < 5:
        print(f"[INFO] Expansion Triggered. Route: {route_distance}km. Current count: {len(quotes)}. Engaging Global Carrier Matrix.")
        
        est = sovereign_engine.generate_market_rate(request.origin, request.destination, request.container)
        
        # COMMODITY INTELLIGENCE MODIFIER
        commodity_factor = 1.0
        if "Hazardous" in request.commodity: commodity_factor = 1.25
        if "Refrigerated" in request.commodity or "Pharma" in request.commodity: commodity_factor = 1.4
        
        est["price"] = int(est["price"] * commodity_factor)
        est["wisdom"] += f" Rate adjusted for {request.commodity} specific handling."
        
        # GLOBAL CARRIER DATABASE — Distance-filtered
        all_carriers = [
            {"id": "MSC", "name": "MSC (Sovereign Direct)", "offset": 1.05, "transit": -1, "vessels": ["MSC OSCAR", "MSC GULSUN", "MSC AMELIA"], "wisdom": "World-leader fleet. Dominates high-capacity corridors with extreme reliability.", "min_distance": 3000},
            {"name": "Hapag-Lloyd (Premium)", "offset": 1.12, "transit": -3, "vessels": ["BERLIN EXPRESS", "HAMBURG EXPRESS"], "wisdom": "Premium German efficiency. Ultra-fast transits for time-sensitive cargo.", "min_distance": 4000},
            {"name": "ZIM (Israel Pioneer)", "offset": 1.15, "transit": -4, "vessels": ["ZIM SAMMY", "ZIM LUANDA"], "wisdom": "Niche priority specialist. Agile schedules for emerging trade lanes.", "min_distance": 2000},
            {"name": "Yang Ming (Taiwan Strong)", "offset": 0.92, "transit": 2, "vessels": ["YM WELLNESS", "YM WREATH"], "wisdom": "Balanced Pacific network. Competitive pricing for large-scale logistics.", "min_distance": 1500},
            {"name": "PIL (Pacific Int)", "offset": 0.94, "transit": 0, "vessels": ["KOTA SALAM", "KOTA SATRIA"], "wisdom": "Intra-Asia/Africa specialist. Deep knowledge of regional hub-spoke logistics.", "min_distance": 500},
            {"name": "Evergreen (Global Reach)", "offset": 0.98, "transit": 1, "vessels": ["EVER GIVEN", "EVER GREET"], "wisdom": "Massive global reach. Stable pricing across all intercontinental trade lanes.", "min_distance": 3000}
        ]
        
        # Filter carriers eligible for this route distance
        carriers = [c for c in all_carriers if route_distance >= c["min_distance"]]
        
        # Cap number of schedules based on distance
        schedules_per_carrier = 2 if route_distance >= 5000 else 1
        
        for c in carriers:
            for i in range(schedules_per_carrier):
                sched_offset = 1.0 + (i * 0.05)
                price = int(est["price"] * c["offset"] * sched_offset)
                transit = max(3, est["transit_time"] + c["transit"] - i)
                vessel = c["vessels"][i % len(c["vessels"])]
                
                departure = datetime.now() + timedelta(days=3 + (i * 4))
                
                # SENTINEL ANALYSIS — use real route distance
                emissions = sovereign_engine.estimate_carbon_footprint(route_distance, request.container) * (0.9 if c["transit"] > 0 else 1.1)
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
        est_emissions = sovereign_engine.estimate_carbon_footprint(route_distance, request.container) * 0.75
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
    
    # FINAL ID INJECTION & PERSISTENCE
    db_quotes = []
    import json
    
    for q in quotes:
        if isinstance(q, dict):
            # Ensure ID exists
            if "id" not in q:
                q["id"] = generate_quote_id(q)
            
            # Map to DB Model
            db_quote = Quote(
                id=q["id"],
                origin=q["origin_locode"],
                destination=q["dest_locode"],
                container_type=q["container_type"],
                carrier_name=q["carrier_name"],
                price=float(q["price"]),
                currency=q["currency"],
                transit_days=q["transit_time_days"],
                valid_until=q["expiration_date"],
                risk_score=q.get("risk_score", 0.0),
                carbon_emissions=q.get("carbon_emissions", 0.0),
                customs_duty_estimate=q.get("customs_duty_estimate", 0.0),
                port_congestion_index=q.get("port_congestion_index", 0.0),
                is_real=q.get("is_real_api_rate", False),
                source_endpoint=q.get("source_endpoint", "Sovereign Engine"),
                request_data=q,  # Store full JSON for reconstruction
                user_id=str(current_user.id) if current_user else None
            )
            db_quotes.append(db_quote)
            
            # Also update the q dict to verify ID is present for frontend
            q["id"] = db_quote.id
        else:
            # Assuming it's an OceanQuote object (Maersk)
            q_dict = q.model_dump()
            q_id = generate_quote_id(q_dict)
            q.id = q_id
            
            db_quote = Quote(
                id=q_id,
                origin=q_dict["origin_locode"],
                destination=q_dict["dest_locode"],
                container_type=q_dict["container_type"],
                carrier_name=q_dict["carrier_name"],
                price=float(q_dict["price"]),
                currency=q_dict["currency"],
                transit_days=q_dict["transit_time_days"],
                valid_until=q_dict["expiration_date"],
                is_real=True,
                source_endpoint="Maersk Spot API",
                request_data=q_dict,
                user_id=str(current_user.id) if current_user else None
            )
            db_quotes.append(db_quote)

    # PERSIST TO LEDGER
    try:
        print(f"[DEBUG] Attempting to persist {len(db_quotes)} quotes to DB...")
        # Merge/Upsert to avoid ID conflicts if same quote generated twice
        for dbq in db_quotes:
            print(f"[DEBUG] Merging Quote ID: {dbq.id}")
            await db.merge(dbq)
        await db.commit()
        print("[DEBUG] Persistence Successful COMMIT complete.")
    except Exception as e:
        print(f"[CRITICAL ERROR] Quote Persistence Failed: {e}")
        # Print stack trace to stderr
        import traceback
        traceback.print_exc()
        await db.rollback()

    # SOVEREIGN BRANDING: Mask competitor names to maintain trust and premium identity
    for q in quotes:
        original = q.get("carrier_name", "") if isinstance(q, dict) else q.carrier_name
        
        # Mapping for "Best of All Time" Sovereign Branding
        mapping = {
            "Maersk": "Sovereign Prime",
            "MSC": "Direct Network",
            "Evergreen": "Global Alliance",
            "Hapag-Lloyd": "Executive Tier",
            "CMA CGM": "Priority Node",
            "ZIM": "Agile Sovereign",
            "ONE": "Pacific Node",
            "Yang Ming": "Direct Flow"
        }
        
        new_name = original
        for key, val in mapping.items():
            if key in original:
                new_name = val
                break
        
        if isinstance(q, dict):
            q["carrier_name"] = new_name
            # Also clean up wisdom if it mentions Maersk
            if "Maersk" in q.get("wisdom", ""):
                 q["wisdom"] = q["wisdom"].replace("Maersk", "Sovereign Network")
        else:
            q.carrier_name = new_name

    return {
        "quotes": quotes,
        "carrier_count": len(quotes)
    }

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
