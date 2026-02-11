import asyncio
import sys
import os

# Ensure backend imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.api.routers.references import get_sailing_schedules

async def test_schedules():
    print("🚢 Testing Sailing Schedules Endpoint...")
    result = await get_sailing_schedules(origin="Shanghai", destination="Jeddah")
    if result.get("success"):
        print("✅ SUCCESS: Schedules Returned")
        print(f"   Count: {result.get('count')}")
        for s in result.get("schedules", []):
            print(f"   - {s['carrier']} | {s['vessel']} | Arrive: {s['arrival'][:10]} | Service: {s['service']}")
    else:
        print("❌ FAILED: No Schedules")
        print(result)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_schedules())
