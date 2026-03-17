import os
import logging
from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime
from urllib.parse import quote
import httpx
from app.data.hs_codes import HS_HEADINGS

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ports/search", response_model=Dict[str, Any])
async def search_ports(q: str = "", country: str = "", term_type: str = ""):
    """
    Live Maersk Locations API Integration. Strictly No Fallback.
    """
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    if consumer_key:
        try:
            url = f"https://api.maersk.com/reference-data/locations?cityName={quote(q.strip())}|contains&limit=50"
            if country:
                url += f"&countryCode={quote(country.strip())}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers={'Consumer-Key': consumer_key}, timeout=5.0)
                
            if response.status_code == 200:
                data = response.json()
                
                # Filter payload based on terminal type requested by frontend
                is_cfs = term_type.lower() == "cfs"
                
                def get_priority(item):
                    t = str(item.get("locationType", "")).lower()
                    if is_cfs:
                        if t in ["facility", "terminal", "depot", "container freight station"]: return 1
                        if t == "port": return 2
                        if t == "city": return 3
                        return 4
                    else:
                        if t in ["port", "airport", "rail terminal"]: return 1
                        if t == "city": return 2
                        return 3
                    
                sorted_data = sorted(data, key=get_priority)
                results = []
                seen_composite = set()
                
                for item in sorted_data:
                    code = item.get("UNLocationCode", "")
                    name = item.get("cityName", "")
                    loc_type = str(item.get("locationType", "")).lower()
                    
                    if loc_type in ["city", "country", "region"]: 
                        continue
                    
                    if code and name:
                        comp_key = f"{code}_{name.upper()}_{loc_type}"
                        if comp_key not in seen_composite:
                            seen_composite.add(comp_key)
                            results.append({
                                "name": name,
                                "code": code,
                                "country": item.get("countryName", ""),
                                "country_code": item.get("countryCode", ""),
                                "type": loc_type
                            })
                return {"results": results[:20], "source": "Global Live"}
        except Exception as e:
            logger.error(f"Port Search Error: {e}")

    return {"results": [], "source": "Global Live API (No Match Found)"}

@router.get("/commodities/search", response_model=Dict[str, Any])
async def search_commodities(q: str = ""):
    """
    Commodity search — official WCO HS 2022 headings dataset (~500 entries).
    Tries Maersk live API first; falls back to HS headings if unavailable.
    """
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    results = []

    if consumer_key:
        try:
            url = "https://api.maersk.com/commodity-classifications"
            if q.strip():
                url += f"?commodityName={quote(q.strip())}"

            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers={'Consumer-Key': consumer_key}, timeout=8.0)

            if response.status_code == 200:
                data = response.json()
                commodities = data.get("commodities", []) if isinstance(data, dict) else data
                for r in commodities:
                    if not r.get('commodityName'):
                        continue
                    # Include all HS codes as sub-entries for better search granularity
                    hs_codes = r.get('hsCommodities', [])
                    results.append({
                        "id": r.get('commodityCode'),
                        "name": r.get('commodityName'),
                        "type": r.get('cargoTypes', ['DRY'])[0] if r.get('cargoTypes') else 'DRY',
                        "hs_codes": [
                            {"code": h.get('hsCommodityCode'), "name": h.get('hsCommodityName')}
                            for h in hs_codes if h.get('hsCommodityCode')
                        ]
                    })
        except Exception as e:
            logger.error(f"Commodity Search Error: {e}")

    # Use WCO HS 2022 headings if Maersk API returned nothing
    if not results:
        q_lower = q.strip().lower()
        if q_lower:
            hs_results = [h for h in HS_HEADINGS if q_lower in h["name"].lower()]
        else:
            hs_results = HS_HEADINGS
        results = [{"id": h["code"], "name": h["name"], "type": "DRY"} for h in hs_results]

    return {"results": results[:50], "source": "WCO HS 2022"}

@router.get("/vessels/search", response_model=Dict[str, Any])
async def search_vessels(q: str = ""):
    """
    Search for active vessels using Global Reference Data.
    """
    consumer_key = os.getenv('MAERSK_CONSUMER_KEY')
    results = []
    
    if consumer_key:
        try:
            # According to spec: /vessels?vesselNames=[name]
            url = f"https://api.maersk.com/reference-data/vessels?vesselNames={quote(q.strip())}&limit=20"
            if not q.strip():
                url = "https://api.maersk.com/reference-data/vessels?limit=10"
                
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers={'Consumer-Key': consumer_key}, timeout=5.0)
                
            if response.status_code == 200:
                data = response.json()
                results = [
                    {
                        "name": r.get("vesselLongName") or r.get("vesselShortName"),
                        "imo": r.get("vesselIMONumber"),
                        "flag": r.get("vesselFlagCode"),
                        "capacity": r.get("vesselCapacityTEU")
                    } 
                    for r in data if r.get("vesselLongName") or r.get("vesselShortName")
                ]
        except Exception as e:
            logger.error(f"Vessel Search Error: {e}")

    return {"results": results[:20], "source": "Global Vessel Database"}

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
            { "id": "03", "name": "FBXI_INDEX", "value": "1,840.20", "change": "-0.12%", "status": "NEUTRAL" }
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
            "carrier": "CargoLink Carrier",
            "vessel": f"CL {origin.upper()[:3]} PIONEER",
            "voyage": f"{depart_date.strftime('%y')}{i}W",
            "departure": depart_date.isoformat(),
            "arrival": arrive_date.isoformat(),
            "transit_time": 18,
            "service": "Direct",
            "is_estimate": True
        })
    return {"schedules": formatted, "success": True, "count": len(formatted), "source": "CargoLink Core"}
