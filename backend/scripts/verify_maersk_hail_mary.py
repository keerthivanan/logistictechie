import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

KEY = os.getenv("MAERSK_CONSUMER_KEY", "").strip()
BASE_URL = "https://api.maersk.com"

ENDPOINTS = {
    "Locations": "/reference-data/locations?cityName=Shanghai",
    "Vessels": "/reference-data/vessels?limit=1",
    "Deadlines": "/shipment-deadlines",
    "Offices": "/booking-offices?officeName=New%20York",
    "Commodities": "/commodity-classifications?commodityName=Cars",
    "Schedules": "/schedules/point-to-point?originGeoId=35T52H1J83751&destinationGeoId=22T52H1J83751&carrierMaersk=true"
}

async def test_endpoint(name, path):
    print(f"\n🧪 Testing {name}: {path}")
    url = f"{BASE_URL}{path}"
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        # 1. NO AUTH (Is it public?)
        try:
            resp = await client.get(url)
            print(f"   [NO AUTH] Status: {resp.status_code}")
            if resp.status_code == 200: return True
        except: pass

        # 2. X-API-KEY (Is it API Key based?)
        try:
            resp = await client.get(url, headers={"Consumer-Key": KEY})
            print(f"   [Consumer-Key Header] Status: {resp.status_code}")
            if resp.status_code == 200: return True
        except: pass

        # 3. Query Param (Legacy?)
        try:
            resp = await client.get(f"{url}{'&' if '?' in url else '?'}consumer_key={KEY}")
            print(f"   [Query Param] Status: {resp.status_code}")
            if resp.status_code == 200: return True
        except: pass

    return False

async def main():
    print("🙏 MAERSK HAIL MARY CHECK")
    print(f"Key: {KEY[:5]}...")
    
    success_count = 0
    for name, path in ENDPOINTS.items():
        if await test_endpoint(name, path):
            print(f"✅ SUCCESS: {name} works!")
            success_count += 1
        else:
            print(f"❌ FAILED: {name} requires OAuth (which is blocked 400)")

    if success_count == 0:
        print("\n💀 CONCLUSION: All 5 APIs strictly require OAuth2. OAuth2 is blocked (400).")
    else:
        print(f"\n🎉 MIRACLE: {success_count} APIs work without OAuth!")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
