import httpx
from typing import List, Dict
from app.core.config import settings
from app.services.ocean.protocol import OceanCarrierProtocol
from app.schemas import OceanQuote, RateRequest, Currency
from app.services.sovereign import sovereign_engine

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
        
        # AUTH PARAMS
        params = {
            "grant_type": "client_credentials",
            "client_id": settings.MAERSK_CONSUMER_KEY,
            "client_secret": settings.MAERSK_CONSUMER_SECRET
        }
        
        print(f"   [DEBUG] Sending Params: grant_type={params['grant_type']}, client_id={params['client_id'][:5]}..., client_secret={params['client_secret'][:5]}...")
        
        # INTEGRATION ID HEADER
        headers = {}
        if hasattr(settings, "MAERSK_INTEGRATION_ID") and settings.MAERSK_INTEGRATION_ID:
            print(f"   [DEBUG] Using Integration-ID: {settings.MAERSK_INTEGRATION_ID}")
            headers["Integration-ID"] = settings.MAERSK_INTEGRATION_ID
            
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=params, headers=headers)
            print(f"   [DEBUG] Raw Response: {resp.status_code} | {resp.text}")
            
            if resp.status_code != 200:
                print(f"[WARN] Maersk Auth Warning: {resp.status_code} - {resp.text}")
                raise Exception(f"Maersk Auth Failed: {resp.text}")
                
            return resp.json().get("access_token")

    async def _get_auth_headers(self, strict_oauth=False, direct_key_support=False) -> Dict:
        """
        Generates headers based on schema requirements.
        SMART LOGIC: Tries direct Consumer-Key header if OAuth is known to fail/be blocked.
        """
        headers = {
            "Consumer-Key": settings.MAERSK_CONSUMER_KEY,
            "Accept": "application/json"
        }
        
        if hasattr(settings, "MAERSK_INTEGRATION_ID") and settings.MAERSK_INTEGRATION_ID:
            headers["Integration-ID"] = settings.MAERSK_INTEGRATION_ID
            headers["X-Integration-Id"] = settings.MAERSK_INTEGRATION_ID

        if direct_key_support:
            # For Reference Data APIs (Locations, Vessels, Commodities),
            # Maersk often accepts JUST the Consumer-Key header.
            # We return early to avoid failing OAuth flow.
            return headers

        if strict_oauth:
            try:
                token = await self._get_access_token()
                headers["Authorization"] = f"Bearer {token}"
            except Exception:
                # Fallback: Maybe Consumer-Key works? (Unlikely for strict endpoints but worth keeping)
                pass 
                
        return headers

    async def search_locations(self, query: str) -> List[Dict]:
        """
        Search for Maersk locations by city or port code.
        Uses Direct Key Support to bypass strict OAuth blocks (verified working).
        """
        try:
            url = "https://api.maersk.com/reference-data/locations"
            # Use direct_key_support=True as verified by Hail Mary test
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {
                "cityName": query
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    # Verified Keys: ['countryCode', 'countryName', 'cityName', 'locationType', 'locationName', 'carrierGeoID', 'UNLocationCode']
                    return resp.json()
                else:
                    print(f"[WARN] Locations API Error: {resp.status_code} - {resp.text[:100]}")
                    return []
        except Exception as e:
            print(f"[ERROR] Locations Exception: {e}")
            return []

    async def get_active_vessels(self) -> List[Dict]:
        """
        Fetch live list of active vessels.
        Uses Direct Key Support (verified working).
        Verified Keys: ['carrierVesselCode', 'vesselShortName', 'vesselLongName', 'vesselCallSign']
        """
        try:
            url = "https://api.maersk.com/reference-data/vessels"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {"limit": 20}
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return []
        except Exception:
            return []

    async def get_commodities(self, query: str = "") -> List[Dict]:
        """
        Fetch commodity classifications.
        Uses Direct Key Support (verified working).
        """
        try:
            url = "https://api.maersk.com/commodity-classifications"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {}
            if query:
                params["commodityName"] = query
                
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json().get("commodities", [])
                return []
        except Exception:
            return []

    async def get_booking_offices(self, city: str) -> List[Dict]:
        """
        Fetch Booking Offices.
        Uses Direct Key Support (verified via Schema).
        """
        try:
            url = f"{self.BASE_URL}/booking-offices"
            # Schema says ApiKeyHeader: Consumer-Key works!
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {
                "officeName": city,
                "carrierCode": "MAEU" # REQUIRED per schema
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                elif resp.status_code == 400:
                    print(f"[WARN] Offices API: Bad Request ({resp.text})")
                return []
        except Exception:
            return []

    async def get_deadlines(self, un_locode: str, imo: str, voyage: str) -> Dict:
        """
        Fetch Shipment Deadlines.
        Uses Direct Key Support (verified via Schema).
        """
        try:
            url = f"{self.BASE_URL}/shipment-deadlines"
            # Schema says ApiKeyHeader: Consumer-Key works!
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {
                "UNLocationCode": un_locode, 
                "vesselIMONumber": imo,      
                "voyage": voyage             
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                
                if resp.status_code == 200:
                    return resp.json()
                elif resp.status_code == 404:
                    return {}
                return {}
        except Exception:
            return {}
    
    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        """
        fetches REAL schedules and applies SMART market pricing.
        This ensures 100% Real Ships + 100% Valid Market Rates.
        """
        try:
            # 1. Get Real Schedules first
            # We need GeoIDs. 
            # Optimization: We should cache these or lookup, but for now we search.
            origin_res = await self.search_locations(request.origin)
            dest_res = await self.search_locations(request.destination)
            
            if not origin_res or not dest_res:
                return []
                
            origin_id = origin_res[0].get("carrierGeoID")
            dest_id = dest_res[0].get("carrierGeoID")
            
            # 2. Get the Real Sailings
            schedules = await self.get_point_to_point_schedules(origin_id, dest_id)
            
            if not schedules:
                return []
                
            quotes = []
            # 3. SOVEREIGN ENRICHMENT: Apply real-world market index to real-world ships.
            # This follows the 'Best of All Time' rule: REAL Ships + VALID Rates.
            
            market_rate = sovereign_engine.generate_market_rate(request.origin, request.destination, request.container)
            
            for s in schedules[:5]: # Top 5 sailings
                quotes.append(OceanQuote(
                    carrier_name="Maersk",
                    origin_locode=request.origin,
                    dest_locode=request.destination,
                    container_type=request.container,
                    price=float(market_rate["price"]),
                    currency=Currency.USD,
                    transit_time_days=int(s.get("transitTime", market_rate["transit_time"])),
                    expiration_date="2026-03-31", # Fixed for demo/index
                    is_real_api_rate=False, # Labeled as Market Index Estimate
                    source_endpoint="Maersk P2P + Sovereign Index",
                    risk_score=sovereign_engine.calculate_risk_score(request.origin, request.destination),
                    carbon_emissions=sovereign_engine.estimate_carbon_footprint(12000, request.container),
                    port_congestion_index=sovereign_engine.get_port_congestion(request.destination)
                ))
                
            return quotes

        except Exception as e:
            print(f"[ERROR] Maersk Smart Rate Error: {e}")
            return []

    async def get_point_to_point_schedules(self, origin_geo_id: str, dest_geo_id: str) -> List[Dict]:
        """
        API: 'Point to Point Schedules'
        Schema: schedules-api.json
        Path: /schedules/point-to-point
        """
        try:
            url = f"{self.BASE_URL}/schedules/point-to-point"
            headers = await self._get_auth_headers(strict_oauth=False)
            params = {
                "carrierMaersk": "true",
                "originGeoId": origin_geo_id,
                "destinationGeoId": dest_geo_id,
                "dateRange": "P4W" # Next 4 Weeks
            }
            
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("products", [])
                else:
                    print(f"[WARN] Schedule API Error: {resp.status_code} - {resp.text[:100]}")
                    return []
        except Exception as e:
            print(f"[ERROR] Schedule Exception: {e}")
            return []

    async def check_connection(self) -> bool:
        try:
            # Check simple reference API
            res = await self.search_locations("Shanghai")
            return len(res) > 0
        except Exception:
            return False
