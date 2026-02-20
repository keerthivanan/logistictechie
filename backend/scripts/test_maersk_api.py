
import asyncio
import httpx
from app.core.config import settings
from app.services.ocean.maersk import MaerskClient

async def test_maersk():
    client = MaerskClient()
    print(f"Testing Maersk API with Key: {settings.MAERSK_CONSUMER_KEY[:5]}...")
    try:
        # Test location search
        results = await client.search_locations("Jeddah")
        print(f"Location Search Result: {len(results)} items found.")
        if results:
            print(f"First result: {results[0].get('cityName')} ({results[0].get('UNLocationCode')})")
        
        # Test token retrieval
        token = await client._get_access_token()
        print(f"OAuth Token: {token[:10]}...")
    except Exception as e:
        print(f"Maersk API Error: {e}")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(test_maersk())
