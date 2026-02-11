import asyncio
import sys
import os

# Helper to import backend services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ocean.maersk import MaerskClient
from app.core.config import settings

# ANSI
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"

async def verify_maersk_live():
    print(f"\n{BOLD}🚢 MAERSK API LIVE DIAGNOSTIC{RESET}\n")
    
    # 1. KEY CHECK
    print(f"{BOLD}[1] CREDENTIALS INSPECTION:{RESET}")
    print(f"   Key    : {settings.MAERSK_CONSUMER_KEY[:5]}..." if settings.MAERSK_CONSUMER_KEY else f"   Key    : {RED}MISSING{RESET}")
    print(f"   Secret : {settings.MAERSK_CONSUMER_SECRET[:5]}..." if settings.MAERSK_CONSUMER_SECRET else f"   Secret : {RED}MISSING{RESET}")
    
    if not settings.MAERSK_CONSUMER_KEY:
        print(f"{RED}❌ ABORT: No Consumer Key found in .env{RESET}")
        return

    client = MaerskClient()

    # 2. OAUTH TOKEN
    print(f"\n{BOLD}[2] OAUTH2 TOKEN EXCHANGE:{RESET}")
    try:
        # We manually call _get_access_token to see the raw error if any
        token = await client._get_access_token()
        if token:
             print(f"{GREEN}✅ SUCCESS: Access Token received ({len(token)} chars){RESET}")
        else:
             print(f"{RED}❌ FAILED: Empty Token{RESET}")
    except Exception as e:
        print(f"{RED}❌ FAILED: {e}{RESET}")
        print(f"{YELLOW}   (Likely causes: Invalid Key/Secret OR IP Address not whitelisted on Maersk Developer Portal){RESET}")
        print(f"   {BOLD}💡 DIAGNOSIS: Engaging 'Sovereign Estimate' Protocol as intended fallback.{RESET}")
        return

    # 3. LOCATION API (SHANGHAI)
    print(f"\n{BOLD}[3] LOCATION API TEST (Query: 'Shanghai'):{RESET}")
    try:
        locs = await client.search_locations("Shanghai")
        if locs:
             print(f"{GREEN}✅ SUCCESS: Found {len(locs)} locations{RESET}")
             print(f"   Example: {locs[0].get('cityName')} ({locs[0].get('geoId')})")
        else:
             print(f"{RED}❌ FAILED: No locations found{RESET}")
    except Exception as e:
         print(f"{RED}❌ ERROR: {e}{RESET}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_maersk_live())
