from fastapi import APIRouter
from app.services.sovereign import sovereign_engine
from app.services.sentinel import sentinel

router = APIRouter()

@router.get("/pulse")
async def get_global_pulse():
    """
    # SOVEREIGN PULSE (Live 2026 Feed)
    Returns:
    1. Financial Indices (SCFI, WCI)
    2. Sentinel Alerts (Red Sea, Panama)
    """
    
    # 1. Financial Ticker
    ticker = sovereign_engine.get_market_ticker()
    
    # 2. Risk Alerts (Sentinel Scan)
    alerts = []
    
    # Red Sea Scan
    red_sea_risk = sovereign_engine.calculate_risk_score("JEDDAH", "ROTTERDAM")
    if red_sea_risk > 50:
        alerts.append({
            "symbol": "SUEZ ALERT", 
            "value": "HIGH TENSION",
            "change": f"Risk {int(red_sea_risk)}%",
            "up": True,
            "alert": True
        })
        
    # Panama Scan
    alerts.append({
        "symbol": "PANAMA",
        "value": "Draft: 44ft", 
        "change": "Restricted",
        "up": False,
        "alert": True
    })

    # Combine
    full_feed = alerts + ticker
    
    return {
        "feed": full_feed,
        "status": "OPERATIONAL",
        "system_version": "v2.0-SOVEREIGN"
    }
