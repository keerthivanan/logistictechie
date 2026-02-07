from fastapi import APIRouter
from typing import List, Dict
from app.schemas import RateRequest, OceanQuote
from app.services.ocean.maersk import MaerskClient
from app.services.ocean.cma_cgm import CmaClient
from app.services.ocean.msc import MscClient
from app.services.ocean.searates import SearatesClient
import asyncio

router = APIRouter()

@router.post("/", response_model=Dict)
async def get_real_ocean_quotes(request: RateRequest):
    """
    Orchestrates REAL calls to Maersk, CMA CGM, MSC, and Searates.
    If no keys are configured, returns an explicit warning.
    """
    maersk = MaerskClient()
    cma = CmaClient()
    msc = MscClient()
    searates = SearatesClient()
    
    # Run in parallel for "Ultra-Best" performance
    results = await asyncio.gather(
        maersk.fetch_real_rates(request),
        cma.fetch_real_rates(request), 
        msc.fetch_real_rates(request),
        searates.fetch_real_rates(request),
        return_exceptions=True
    )
    
    all_quotes: List[OceanQuote] = []
    errors = []
    
    for res in results:
        if isinstance(res, list):
            all_quotes.extend(res)
        else:
            errors.append(str(res))
            
    # DIAGNOSTIC: Check connectivity status
    auth_warning = None
    if len(all_quotes) == 0:
        connected = await asyncio.gather(
            maersk.check_connection(),
            cma.check_connection(),
            msc.check_connection(),
            searates.check_connection()
        )
        
        if not any(connected):
            auth_warning = "SETUP REQUIRED: No valid API Keys found in .env. Please configure keys for Maersk, CMA, MSC, or Searates to see real rates."
            
    return {
        "success": True,
        "quotes": all_quotes,
        "warning": auth_warning,
        "debug_errors": errors,
        "carrier_count": 4
    }
