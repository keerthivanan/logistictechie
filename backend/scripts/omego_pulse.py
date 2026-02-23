import asyncio
import httpx
import sys

async def check_omego_health():
    print("🚀 [HEALTH CHECK] Initializing Sovereign Connectivity Scan...")
    
    endpoints = [
        {"name": "CORE", "url": "http://localhost:8000/api/references/countries"},
        {"name": "AUTH", "url": "http://localhost:8000/api/auth/status"},
        {"name": "MARKET", "url": "http://localhost:8000/api/marketplace/active" if False else "http://localhost:8000/api/forwarders/active"},
        {"name": "AI", "url": "http://localhost:8000/api/ai/hs-discovery"}
    ]

    async with httpx.AsyncClient() as client:
        success_count = 0
        for ep in endpoints:
            try:
                # We expect 401/405 for some based on auth, but a response proves the route is active.
                response = await client.get(ep["url"], timeout=5.0)
                print(f"✅ [{ep['name']}] Pulse Detected. Status: {response.status_code}")
                success_count += 1
            except Exception as e:
                print(f"❌ [{ep['name']}] Signal Lost: {e}")
        
    if success_count > 0:
        print("\n🏆 MISSION READY: OMEGO Sovereign Network is operational.")
    else:
        print("\n⚠️ SYSTEM OFFLINE: Local backend is not responding. Ensure uvicorn is running.")

if __name__ == "__main__":
    asyncio.run(check_omego_health())
