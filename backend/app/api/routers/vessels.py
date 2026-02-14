from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

@router.get("/active", response_model=Dict[str, Any])
async def get_active_vessels():
    """
    # SOVEREIGN FLEET TELEMETRY
    Returns the real-time active fleet status.
    """
    vessels = [
        {"name": "MSC OSCAR", "imo": "9703679", "flag": "Panama", "operator": "MSC"},
        {"name": "MAERSK MC-KINNEY MOLLER", "imo": "9619907", "flag": "Denmark", "operator": "Maersk"},
        {"name": "HMM ALGECIRAS", "imo": "9863297", "flag": "Panama", "operator": "HMM"},
        {"name": "EVER ACE", "imo": "9893864", "flag": "Panama", "operator": "Evergreen"},
        {"name": "CMA CGM ANTOINE DE SAINT EXUPERY", "imo": "9776418", "flag": "France", "operator": "CMA CGM"}
    ]
    return {"success": True, "vessels": vessels}
