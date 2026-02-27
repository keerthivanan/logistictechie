
import asyncio
import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

async def test_endpoints():
    print("🚀 STARTING SOVEREIGN ENDPOINT AUDIT...")
    
    async with httpx.AsyncClient() as client:
        # 1. Health Check
        print("\n[1/5] Checking System Health...")
        try:
            res = await client.get(f"{BASE_URL}/health")
            print(f"✅ Health: {res.status_code} - {res.json()}")
        except Exception as e:
            print(f"❌ Health Check Failed: {e}")

        # 2. List Active Forwarders
        print("\n[2/5] Checking Forwarder Directory...")
        res = await client.get(f"{BASE_URL}/api/forwarders/active")
        if res.status_code == 200:
            print(f"✅ Active Partners: {len(res.json())} found")
        else:
            print(f"❌ Failed to list forwarders: {res.status_code}")

        # 3. Check Dashboard Path (Public/Auth requirement check)
        print("\n[3/5] Checking Dashboard Route Integrity...")
        res = await client.get(f"{BASE_URL}/api/forwarders/dashboard/REG-OMEGO-0003")
        if res.status_code == 401:
            print("✅ Dashboard correctly guarded (401 Unauthorized as expected without token)")
        elif res.status_code == 404:
            print("❌ Dashboard returned 404 (Route potentially missing or ID wrong)")
        else:
            print(f"ℹ️ Dashboard status: {res.status_code}")

        # 4. Auth Me Payload (Static check for fields)
        print("\n[4/5] Checking Auth Schema Evolution...")
        # Note: We can't easily get a token here without real creds, but we can check if the route exists
        res = await client.get(f"{BASE_URL}/api/auth/me")
        if res.status_code == 401:
            print("✅ Auth/Me correctly guarded")
        else:
            print(f"ℹ️ Auth/Me status: {res.status_code}")

    print("\n[5/5] ENDPOINT AUDIT COMPLETE. 🛡️")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
