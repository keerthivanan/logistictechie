
import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ocean.maersk import maersk_client

async def debug_keys():
    print("🔍 INSPECTING VESSEL DATA KEYS...")
    try:
        vessels = await maersk_client.get_active_vessels()
        if vessels:
            first = vessels[0]
            print(f"   🔑 KEYS: {list(first.keys())}")
            print(f"   📄 DATA: {first}")
        else:
            print("   ⚠️  No vessels returned.")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(debug_keys())
