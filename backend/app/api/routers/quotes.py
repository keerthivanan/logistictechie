from fastapi import APIRouter
from typing import List, Dict
from app.schemas import RateRequest, OceanQuote
from app.services.ocean.maersk import MaerskClient
from app.services.ocean.cma_cgm import CmaClient
from app.services.ocean.msc import MscClient
from app.services.ocean.searates import SearatesClient
from app.services.sovereign import sovereign_engine
import asyncio

router = APIRouter()

@router.post("/", response_model=Dict)
async def get_real_ocean_quotes(request: RateRequest):
    """
    Orchestrates REAL calls and enriches them with Sovereign Intelligence.
    """
    maersk = MaerskClient()
    cma = CmaClient()
    msc = MscClient()
    searates = SearatesClient()
    
    # 👑 SOVEREIGN INTELLIGENCE: Decrypt Port Codes (e.g. CNSHA -> Shanghai)
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
        
    # 2. ADDITIONAL REAL CARRIERS (CMA/MSC/Searates)
    # These will attempt real calls if keys are present.
    other_clients = [cma, msc, searates]
    for client in other_clients:
        try:
            client_quotes = await client.fetch_real_rates(request)
            if client_quotes:
                quotes.extend(client_quotes)
        except Exception as e:
            print(f"[WARN] {client.__class__.__name__} Fetch Error: {e}")
    
    return {
        "success": True,
        "quotes": quotes,
        "carrier_count": len(quotes)
    }
