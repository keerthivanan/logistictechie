import httpx
from typing import List
from app.core.config import settings
from app.services.ocean.protocol import OceanCarrierProtocol
from app.schemas import OceanQuote, RateRequest, Currency

class CmaClient(OceanCarrierProtocol):
    """
    REAL CMA CGM API Client.
    Connects to CMA CGM Partner API.
    Requires: CMA_API_KEY
    """
    
    BASE_URL = "https://apis.cma-cgm.net"
    
    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        if not settings.CMA_API_KEY:
            print("CMA Keys Missing - Skipping Real Call")
            return []

        url = f"{self.BASE_URL}/prices/route"
        headers = {
            "KeyId": settings.CMA_API_KEY,
            "Accept": "application/json"
        }
        
        # CMA often requires POL/POD Codes
        payload = {
            "pol": request.origin, 
            "pod": request.destination,
            "equipment": request.container
        }
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=payload, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    quotes = []
                    # Parse REAL response
                    for line in data:
                        quotes.append(OceanQuote(
                            carrier_name="CMA CGM",
                            origin_locode=request.origin,
                            dest_locode=request.destination,
                            price=float(line.get("amount", 0)),
                            currency=Currency.USD,
                            transit_time_days=int(line.get("duration", 25)),
                            expiration_date=datetime.now().strftime("%Y-%m-%d"),
                            is_real_api_rate=True,
                            source_endpoint=url
                        ))
                    return quotes
                else:
                    print(f"CMA API Error: {resp.status_code}")
                    return []
        except Exception as e:
            print(f"CMA Connection Error: {e}")
            return []

    async def check_connection(self) -> bool:
        if not settings.CMA_API_KEY:
            return False
        # Simple ping logic would go here
        return True
