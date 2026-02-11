import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

KEY = os.getenv("MAERSK_CONSUMER_KEY", "").strip()
BASE_URL = "https://api.maersk.com"

async def test_endpoint(name, method, url, params, headers):
    print(f"\n🧪 Testing {name}...")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.request(method, url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                count = len(data) if isinstance(data, list) else 1
                if isinstance(data, dict) and 'data' in data: count = len(data['data'])
                print(f"   ✅ SUCCESS! Status: 200 | Items: {count}")
                return True
            else:
                print(f"   ❌ FAILED! Status: {resp.status_code} | {resp.text[:100]}")
                return False
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        return False

async def main():
    print("🕵️ MAERSK 5-POINT FINAL INSPECTION")
    headers = {"Consumer-Key": KEY, "Accept": "application/json"}
    
    # 1. LOCATIONS
    await test_endpoint("Locations", "GET", f"{BASE_URL}/reference-data/locations", 
                       {"cityName": "Shanghai"}, headers)

    # 2. VESSELS
    await test_endpoint("Vessels", "GET", f"{BASE_URL}/reference-data/vessels", 
                       {"limit": 5}, headers)

    # 3. COMMODITIES
    await test_endpoint("Commodities", "GET", f"{BASE_URL}/commodity-classifications", 
                       {"commodityName": "Cars"}, headers)

    # 4. OFFICES
    await test_endpoint("Offices", "GET", f"{BASE_URL}/booking-offices", 
                       {"officeName": "New York", "carrierCode": "MAEU"}, headers)

    # 5. DEADLINES
    # Need a valid vessel/voyage. Hard to guess.
    # We will skip valid test for now but checking if Auth passes (404 is better than 401)
    await test_endpoint("Deadlines (Auth Check)", "GET", f"{BASE_URL}/shipment-deadlines", 
                       {"UNLocationCode": "CNHKG", "vesselIMONumber": "9999999", "voyage": "999W"}, headers)

    # 6. SCHEDULES (Bonus Check)
    await test_endpoint("Schedules (Bonus)", "GET", f"{BASE_URL}/schedules/point-to-point", 
                       {"originGeoId": "35T52H1J83751", "destinationGeoId": "22T52H1J83751", "carrierMaersk": "true"}, headers)

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
