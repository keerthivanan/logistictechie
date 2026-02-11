import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.services.ocean.maersk import MaerskClient
from app.core.config import settings

async def main():
    print(f"--- 🌊 Maersk Protocol Audit ---")
    print(f"Key: {settings.MAERSK_CONSUMER_KEY[:5]}...")
    print(f"Integration ID: {settings.MAERSK_INTEGRATION_ID}")
    
    client = MaerskClient()
    
    print("\n1. Testing Reference Data (Direct Key Support)...")
    try:
        locations = await client.search_locations("Shanghai")
        if locations:
            print(f"✅ SUCCESS: Found {len(locations)} locations.")
            print(f"Sample: {locations[0].get('cityName')} ({locations[0].get('UNLocationCode')})")
        else:
            print("❌ FAILED: No locations returned.")
    except Exception as e:
        print(f"❌ ERROR: {e}")

    print("\n2. Testing OAuth Token Flow (Strict Auth)...")
    try:
        token = await client._get_access_token()
        if token:
            print(f"✅ SUCCESS: Token obtained. ({token[:10]}...)")
        else:
            print("❌ FAILED: Empty token returned.")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
