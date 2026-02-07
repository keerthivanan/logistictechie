import httpx
from typing import List
from app.core.config import settings
from app.services.ocean.protocol import OceanCarrierProtocol
from app.schemas import OceanQuote, RateRequest, Currency

class MaerskClient(OceanCarrierProtocol):
    """
    REAL Maersk API Client.
    Connects to https://api.maersk.com
    Requires: MAERSK_CONSUMER_KEY, MAERSK_CONSUMER_SECRET
    """
    
    BASE_URL = "https://api.maersk.com"
    
    async def _get_access_token(self) -> str:
        """
        Exchanges Consumer Key/Secret for an OAuth Token.
        """
        if not settings.MAERSK_CONSUMER_KEY or not settings.MAERSK_CONSUMER_SECRET:
            raise ValueError("Maersk API Credentials Missing in .env")

        url = f"{self.BASE_URL}/oauth2/access_token"
        params = {
            "grant_type": "client_credentials",
            "client_id": settings.MAERSK_CONSUMER_KEY,
            "client_secret": settings.MAERSK_CONSUMER_SECRET
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, data=params)
            if resp.status_code != 200:
                raise Exception(f"Maersk Auth Failed: {resp.text}")
            return resp.json().get("access_token")

    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        try:
            token = await self._get_access_token()
        except ValueError:
            # If keys are missing, we return empty list so the app doesn't crash, 
            # but we allow the UI to show "Maersk: Config Required".
            print("Maersk Keys Missing - Skipping Real Call")
            return []
        except Exception as e:
            print(f"Maersk Auth Error: {e}")
            return []

        # Real Spot Rate Endpoint
        url = f"{self.BASE_URL}/oceanProducts/rates"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        payload = {
            "origin": {"locationId": request.origin}, # Expecting UN/LOCODE e.g. CNSHA
            "destination": {"locationId": request.destination}, # Expecting UN/LOCODE e.g. SADMM
            "containerType": request.container,
            "commodity": "FAK"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                # Parse REAL response here
                quotes = []
                for product in data.get("products", []):
                    quotes.append(OceanQuote(
                        carrier_name="Maersk",
                        origin_locode=request.origin,
                        dest_locode=request.destination,
                        price=float(product.get("totalPrice", 0)),
                        currency=Currency(product.get("currency", "USD")),
                        transit_time_days=int(product.get("transitTime", 20)),
                        expiration_date=product.get("expirationDate"),
                        is_real_api_rate=True,
                        source_endpoint=url
                    ))
                return quotes
            else:
                print(f"Maersk API Error: {resp.status_code} - {resp.text}")
                return []

    async def check_connection(self) -> bool:
        try:
            await self._get_access_token()
            return True
        except Exception:
            return False
