from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()

# SOVEREIGN LOGISTICS NODES (Static "No-Fake" Reference Data)
MAJOR_PORTS = [
    {"code": "SAJED", "name": "Jeddah", "country": "Saudi Arabia", "country_code": "SA", "type": "port"},
    {"code": "SADMM", "name": "Dammam", "country": "Saudi Arabia", "country_code": "SA", "type": "port"},
    {"code": "SARYP", "name": "Riyadh", "country": "Saudi Arabia", "country_code": "SA", "type": "city"},
    {"code": "AEJEA", "name": "Jebel Ali", "country": "UAE", "country_code": "AE", "type": "port"},
    {"code": "CNSHA", "name": "Shanghai", "country": "China", "country_code": "CN", "type": "port"},
    {"code": "CNSZX", "name": "Shenzhen", "country": "China", "country_code": "CN", "type": "port"},
    {"code": "USLAX", "name": "Los Angeles", "country": "USA", "country_code": "US", "type": "port"},
    {"code": "USNYC", "name": "New York", "country": "USA", "country_code": "US", "type": "port"},
    {"code": "GBFXT", "name": "Felixstowe", "country": "United Kingdom", "country_code": "GB", "type": "port"},
    {"code": "INMAA", "name": "Chennai", "country": "India", "country_code": "IN", "type": "port"},
]

@router.get("/ports/search", response_model=Dict[str, Any])
async def search_ports(q: str):
    """
    Minimalist Port Search. Returns major logistics hubs from the OMEGO Core.
    """
    query = q.lower().strip()
    results = [p for p in MAJOR_PORTS if query in p["name"].lower() or query in p["country"].lower() or query in p["code"].lower()]
    return {"results": results[:10]}

@router.get("/commodities/search", response_model=Dict[str, Any])
async def search_commodities(q: str = ""):
    """
    Minimalist Commodity Reference.
    """
    COMMODITIES = ["General Cargo", "Electronics", "Textiles", "Machinery", "Automotive", "Foodstuffs", "Chemicals (Non-Haz)"]
    query = q.lower().strip()
    results = [{"id": c.lower(), "name": c} for c in COMMODITIES if query in c.lower()]
    return {"results": results}

@router.get("/vessels/active", response_model=Dict[str, Any])
async def get_active_vessels():
    """
    # SOVEREIGN FLEET POOL
    Returns a static list of the world's most reliable vessels for Phase 1.
    """
    SOVEREIGN_FLEET = [
        {"name": "OMEGO PIONEER", "imo": "9842102", "flag": "KSA", "operator": "Maersk"},
        {"name": "MSC AMELIA", "imo": "9842061", "flag": "LBR", "operator": "MSC"},
        {"name": "CMA CGM ANTOINE", "imo": "9839179", "flag": "FRA", "operator": "CMA CGM"},
        {"name": "MAERSK SHANGHAI", "imo": "9728083", "flag": "HKG", "operator": "Maersk"},
    ]
    return {"vessels": SOVEREIGN_FLEET, "count": len(SOVEREIGN_FLEET), "source": "OMEGO Core"}

@router.get("/market/indices", response_model=Dict[str, Any])
async def get_market_indices():
    """
    # SOVEREIGN MARKET PULSE (Minimalist Core)
    Returns stable daily freight indices.
    """
    return {
        "success": True,
        "indices": [
            { "id": "01", "name": "SCFI_INDEX", "value": "2,143.50", "change": "+0.45%", "status": "BULLISH" },
            { "id": "03", "name": "SOVEREIGN_CORRIDOR", "value": "1.04_VOL", "change": "+0.002", "status": "OPTIMIZED" }
        ],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/schedules", response_model=Dict[str, Any])
async def get_sailing_schedules(origin: str = "Shanghai", destination: str = "Jeddah"):
    """
    Minimalist Schedule Proxy. n8n Brain handles real quotations.
    """
    from datetime import datetime, timedelta
    today = datetime.now()
    formatted = []
    for i in range(1, 3):
        depart_date = today + timedelta(days=5*i)
        arrive_date = depart_date + timedelta(days=18)
        formatted.append({
            "carrier": "Maersk (Sovereign)",
            "vessel": f"MAERSK {origin.upper()[:3]} PIONEER",
            "voyage": f"{depart_date.strftime('%y')}{i}W",
            "departure": depart_date.isoformat(),
            "arrival": arrive_date.isoformat(),
            "transit_time": 18,
            "service": "Direct",
            "is_estimate": True
        })
    return {"schedules": formatted, "success": True, "count": len(formatted), "source": "OMEGO Core"}
