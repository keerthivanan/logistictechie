import asyncio
import httpx
import os

URL = "http://localhost:8000/api/ports/search"

async def test_frontend_url():
    print(f"🌍 Testing Frontend Endpoint: {URL}?q=Shanghai")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(URL, params={"q": "Shanghai"})
            print(f"   Status: {resp.status_code}")
            print(f"   Response: {resp.text[:200]}")
            
            if resp.status_code == 200 and "Shanghai" in resp.text:
                print("✅ BACKEND IS REACHABLE & WORKING!")
                print("   If frontend fails, check Browser Console (F12) for CORS or Network errors.")
            else:
                print("❌ BACKEND FAILED.")
                print("   Make sure running: 'uvicorn app.main:app --reload'")
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")
        print("   Backend is likely NOT RUNNING.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_frontend_url())
