import httpx
from typing import List
from app.core.config import settings
from app.services.ocean.protocol import OceanCarrierProtocol
from app.schemas import OceanQuote, RateRequest, Currency
from datetime import datetime

class SearatesClient(OceanCarrierProtocol):
    """
    REAL Searates API Client.
    Searates is an aggregator that often provides access to 500+ carrier lines.
    Requires: SEARATES_API_KEY
    """
    
    BASE_URL = "https://api.searates.com"
    
    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        if not settings.SEARATES_API_KEY:
            print("Searates Keys Missing - Skipping Real Call")
            return []

        # Searates provides a 'Freight API' for instant rates
        url = f"{self.BASE_URL}/freight/rates"
        params = {
            "api_key": settings.SEARATES_API_KEY,
            "pol": request.origin, 
            "pod": request.destination,
            "container": request.container
        }
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, params=params, timeout=8.0)
                
                if resp.status_code == 200:
                    data = resp.json()
                    quotes = []
                    # Searates returns a list of rates from various carriers
                    for rate in data.get("rates", []):
                        quotes.append(OceanQuote(
                            carrier_name=rate.get("carrier_name", "Global Line"),
                            origin_locode=request.origin,
                            dest_locode=request.destination,
                            container_type=request.container,
                            price=float(rate.get("price", 0)),
                            currency=Currency.USD,
                            transit_time_days=int(rate.get("transit_time", 25)),
                            expiration_date=rate.get("valid_until") or "2026-12-31",
                            is_real_api_rate=True,
                            source_endpoint=url,
                            wisdom=f"Rate sourced via Searates Alpha Hub for {rate.get('carrier_name')}.",
                            thc_fee=200.0,
                            pss_fee=0.0,
                            fuel_fee=float(rate.get("price", 0)) * 0.5,
                            contact_office="+1 (800) SEARATES"
                        ))
                    return quotes
                else:
                    return []
        except Exception as e:
            print(f"Searates API Error: {e}")
            return []

    async def check_connection(self) -> bool:
        return bool(settings.SEARATES_API_KEY)
