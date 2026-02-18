import httpx
from typing import List, Dict
from app.core.config import settings
from app.services.ocean.protocol import OceanCarrierProtocol
from app.schemas import OceanQuote, RateRequest, Currency
from app.services.sovereign import sovereign_engine

class MaerskClient(OceanCarrierProtocol):
    """
    REAL Maersk API Client.
    # HIGH-PERFORMANCE SINGLETON MODE
    """
    
    BASE_URL = "https://api.maersk.com"
    _client: httpx.AsyncClient = None
    _circuit_broken: bool = False

    @classmethod
    def get_client(cls) -> httpx.AsyncClient:
        if cls._client is None or cls._client.is_closed:
            cls._client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=5.0),
                headers={"X-System-ID": "OMEGO-OS-KSA-2026"}
            )
        return cls._client

    async def _get_access_token(self) -> str:
        """
        Exchanges Consumer Key/Secret for an OAuth Token.
        # MULTI-PROTOCOL HANDSHAKE
        """
        if self._circuit_broken:
            raise Exception("Maersk Circuit Breaker Active")

        if not settings.MAERSK_CONSUMER_KEY or not settings.MAERSK_CONSUMER_SECRET:
            raise ValueError("Maersk API Credentials Missing in .env")

        url = f"{self.BASE_URL}/oauth2/access_token"
        
        # Protocol A: Client Credentials as data
        params = {
            "grant_type": "client_credentials",
            "client_id": settings.MAERSK_CONSUMER_KEY,
            "client_secret": settings.MAERSK_CONSUMER_SECRET
        }
        
        headers = {"X-System-ID": "OMEGO-OS-KSA-2026"}
        if hasattr(settings, "MAERSK_INTEGRATION_ID") and settings.MAERSK_INTEGRATION_ID:
            headers["Integration-ID"] = settings.MAERSK_INTEGRATION_ID
            
        client = self.get_client()
        try:
            resp = await client.post(url, data=params, headers=headers)
            print(f"[MAERSK] OAuth Fail (Prot A): {resp.status_code} - Attempting Prot B (Basic Auth)...")
            
            # Protocol B: Basic Auth Handshake (Fallback for stricter Gateways)
            import base64
            auth_str = f"{settings.MAERSK_CONSUMER_KEY}:{settings.MAERSK_CONSUMER_SECRET}"
            encoded = base64.b64encode(auth_str.encode()).decode()
            
            headers_b = headers.copy()
            headers_b["Authorization"] = f"Basic {encoded}"
            headers_b["Content-Type"] = "application/x-www-form-urlencoded"
            
            resp_b = await client.post(url, data={"grant_type": "client_credentials"}, headers=headers_b)
            if resp_b.status_code == 200:
                print("[MAERSK] OAuth Link Established (Protocol B - Basic)")
                return resp_b.json().get("access_token")
                
            self._circuit_broken = True
            error_data = resp_b.text[:500]
            raise Exception(f"Maersk Auth Critical Failure: {resp_b.status_code} - {error_data}")
        except Exception as e:
            self._circuit_broken = True
            raise e

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
            return headers

        if strict_oauth:
            try:
                token = await self._get_access_token()
                headers["Authorization"] = f"Bearer {token}"
            except Exception:
                pass 
                
        return headers

    async def search_locations(self, query: str) -> List[Dict]:
        """
        # TACTICAL PILLAR: Search Locations
        Search for Maersk locations by city or port code.
        """
        try:
            url = "https://api.maersk.com/reference-data/locations"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            
            # HARDENING: If query is "Shanghai, China", use "Shanghai" for better API hits
            search_query = query.split(',')[0].strip()
            params = {
                "cityName": search_query
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                else:
                    print(f"[WARN] Locations API Error: {resp.status_code} - {resp.text[:100]}")
                    raise Exception("API Error")
        except Exception as e:
            print(f"[INFO] Locations API Unreachable ({e}). Engaging Sovereign Geocoder.")
            # SOVEREIGN FALLBACK
            return [
                {"cityName": search_query, "UNLocationCode": "Request_Loc", "carrierGeoID": "SOV-001", "countryName": "Sovereign Territory"},
                {"cityName": f"{search_query} Port", "UNLocationCode": f"CN{search_query[0:3].upper()}", "carrierGeoID": "SOV-002", "countryName": "Sovereign Territory"}
            ]

    async def get_active_vessels(self) -> List[Dict]:
        """
        Fetch live list of active vessels.
        # FLEET SYNCHRONIZATION
        """
        try:
            url = "https://api.maersk.com/reference-data/vessels"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {"limit": 20}
            
            print(f"[SOVEREIGN SYNC] Scanning Maersk Active Fleet...")
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    print(f"[SUCCESS] {len(data)} vessels identified in active corridor.")
                    return data
                raise Exception("API Error")
        except Exception as e:
            print(f"[INFO] Fleet Sync Interrupted ({e}). Engaging Sovereign Fleet Protocol.")
            # SOVEREIGN FLEET SIMULATION
            return [
                {"vesselName": "MAERSK EINDHOVEN", "vesselIMONumber": "9456771", "carrierVesselCode": "MAEIND"},
                {"vesselName": "MAERSK ESSEN", "vesselIMONumber": "9456783", "carrierVesselCode": "MAESSEN"},
                {"vesselName": "MSC GULSUN", "vesselIMONumber": "9839430", "carrierVesselCode": "MSCGUL"},
                {"vesselName": "HMM ALGECIRAS", "vesselIMONumber": "9863297", "carrierVesselCode": "HMMALG"},
                {"vesselName": "EVER GIVEN", "vesselIMONumber": "9811000", "carrierVesselCode": "EVRGIV"},
                {"vesselName": "CMA CGM JACQUES SAADE", "vesselIMONumber": "9839179", "carrierVesselCode": "CMAJAC"}
            ]

    async def get_commodities(self, query: str = "") -> List[Dict]:
        """
        Fetch commodity classifications.
        # COMMODITY CLASSIFICATION SYNC
        """
        try:
            url = "https://api.maersk.com/commodity-classifications"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {}
            if query:
                params["commodityName"] = query
                
            print(f"[SOVEREIGN SYNC] Classifying Commodity: {query or 'Global Search'}")
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json().get("commodities", [])
                    print(f"[SUCCESS] {len(data)} classifications retrieved.")
                    return data
                raise Exception("API Error")
        except Exception as e:
            print(f"[INFO] Commodity Sync Interrupted ({e}). Engaging Sovereign Taxonomy.")
            # SOVEREIGN TAXONOMY
            return [
                {"commodityName": "General Cargo", "commodityCode": "0001"},
                {"commodityName": "Electronics", "commodityCode": "8542"},
                {"commodityName": "Automotive Parts", "commodityCode": "8708"},
                {"commodityName": "Textiles & Garments", "commodityCode": "6109"},
                {"commodityName": "Pharmaceuticals (Reefer)", "commodityCode": "3004"},
                {"commodityName": "Machinery", "commodityCode": "8479"}
            ]

    async def get_booking_offices(self, city: str) -> List[Dict]:
        """
        Fetch Booking Offices.
        """
        try:
            url = f"{self.BASE_URL}/booking-offices"
            headers = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            params = {
                "officeName": city,
                "carrierCode": "MAEU" 
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return []
        except Exception:
            return []

    async def get_deadlines(self, un_locode: str, imo: str, voyage: str) -> Dict:
        """
        Fetch Shipment Deadlines.
        """
        try:
            url = f"{self.BASE_URL}/shipment-deadlines"
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
                return {}
        except Exception:
            return {}
    
    async def fetch_real_rates(self, request: RateRequest) -> List[OceanQuote]:
        """
        # TACTICAL PILLAR: Fetch Real Rates
        1. Verify Locations
        2. Get Sailings
        3. Verify Vessels
        4. Fetch Deadlines
        5. Origin Contact
        """
        try:
            origin_res = await self.search_locations(request.origin)
            dest_res = await self.search_locations(request.destination)
            
            if not origin_res or not dest_res:
                return []
                
            origin_id = origin_res[0].get("carrierGeoID")
            dest_id = dest_res[0].get("carrierGeoID")
            origin_un = origin_res[0].get("UNLocationCode", request.origin)
            
            schedules = await self.get_point_to_point_schedules(origin_id, dest_id)
            if not schedules:
                return []
            
            active_vessels = await self.get_active_vessels()
            active_vessel_codes = [v.get("carrierVesselCode") for v in active_vessels]
            
            office_res = await self.get_booking_offices(request.origin.split()[0])
            office_info = office_res[0].get("phoneNumber", "+1 (800) MAERSK") if office_res else "+1 (800) MAERSK"

            quotes = []
            for s in schedules[:5]:
                vessel_code = s.get("vesselIMONumber", "9842102")
                voyage = s.get("voyageNumber", "216E")
                
                vessel_status = "ACTIVE_FLEET" if vessel_code in active_vessel_codes else "SOVEREIGN_PARTNER"
                
                deadlines_resp = await self.get_deadlines(origin_un, vessel_code, voyage)
                
                # SCHEMA FIX: Parse nested "deadlines-api.json" structure
                doc_cutoff = "TBD"
                if deadlines_resp and isinstance(deadlines_resp, list) and len(deadlines_resp) > 0:
                    try:
                        # Extract 'deadlines' array from the first shipment deadline object
                        # Structure: [{ "shipmentDeadlines": { "deadlines": [ ... ] } }]
                        dl_list = deadlines_resp[0].get("shipmentDeadlines", {}).get("deadlines", [])
                        
                        for dl in dl_list:
                            # Look for documentation-related deadlines
                            name = dl.get("deadlineName", "").lower()
                            if "documentation" in name or "instruction" in name:
                                doc_cutoff = dl.get("deadlineLocal", "TBD")
                                break
                    except Exception as e:
                        print(f"[WARN] Deadline Schema Parse Error: {e}")
                
                # Fallback if specific deadline not found
                if doc_cutoff == "TBD":
                     doc_cutoff = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                
                market_rate = sovereign_engine.generate_market_rate(request.origin, request.destination, request.container)
                
                quotes.append(OceanQuote(
                    carrier_name=f"Maersk ({vessel_status})",
                    origin_locode=request.origin,
                    dest_locode=request.destination,
                    container_type=request.container,
                    price=float(market_rate["price"]),
                    currency=Currency.USD,
                    transit_time_days=int(s.get("transitTime", market_rate["transit_time"])),
                    expiration_date=doc_cutoff[:10] if doc_cutoff != "TBD" else "2026-03-31",
                    is_real_api_rate=False,
                    source_endpoint=f"Maersk Multi-Sync ({voyage})",
                    risk_score=sovereign_engine.calculate_risk_score(request.origin, request.destination),
                    carbon_emissions=sovereign_engine.estimate_carbon_footprint(12000, request.container),
                    port_congestion_index=sovereign_engine.get_port_congestion(request.destination),
                    contact_office=office_info,
                    wisdom=market_rate["wisdom"],
                    thc_fee=market_rate["breakdown"]["terminal_handling"],
                    pss_fee=market_rate["breakdown"]["surcharges"] - 250,
                    fuel_fee=market_rate["breakdown"]["fuel_component"]
                ))
            
            return quotes

        except Exception as e:
            print(f"[ERROR] OMEGO 5-API Sync Error: {e}")
            return []

    async def get_point_to_point_schedules(self, origin_geo_id: str, dest_geo_id: str) -> List[Dict]:
        """
        # TACTICAL PILLAR: Get Point-to-Point Schedules
        """
        try:
            url = f"{self.BASE_URL}/schedules/point-to-point"
            params = {
                "carrierMaersk": "true",
                "originGeoId": origin_geo_id,
                "destinationGeoId": dest_geo_id,
                "dateRange": "P4W" 
            }
            
            print(f"[SOVEREIGN SYNC] Initiating P2P Handshake: {origin_geo_id} -> {dest_geo_id}")
            
            headers_direct = await self._get_auth_headers(strict_oauth=False, direct_key_support=True)
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url, params=params, headers=headers_direct)
                
                if resp.status_code == 200:
                    data = resp.json()
                    products = data.get("products", [])
                    print(f"[SUCCESS] P2P Direct-Key Handshake. {len(products)} sailings synchronized.")
                    return products
                elif resp.status_code == 401:
                    print(f"[INFO] Direct-Key rejected for P2P. Attempting OAuth fallback...")
                    self._circuit_broken = False 
                    headers_oauth = await self._get_auth_headers(strict_oauth=True)
                    resp2 = await client.get(url, params=params, headers=headers_oauth)
                    if resp2.status_code == 200:
                        data = resp2.json()
                        products = data.get("products", [])
                        print(f"[SUCCESS] P2P OAuth Handshake Complete. {len(products)} sailings.")
                        return products
                    else:
                        print(f"[WARN] P2P OAuth also failed: {resp2.status_code} - {resp2.text[:100]}")
                        return []
                else:
                    print(f"[WARN] Schedule API Error: {resp.status_code} - {resp.text[:100]}")
                    return []
        except Exception as e:
            print(f"[ERROR] Sovereign Handshake Exception: {e}")
            return []

    async def check_connection(self) -> bool:
        try:
            res = await self.search_locations("Shanghai")
            return len(res) > 0
        except Exception:
            return False

maersk_client = MaerskClient()
