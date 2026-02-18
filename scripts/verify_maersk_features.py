
import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ocean.maersk import maersk_client
from app.core.config import settings

async def verify_maersk_features():
    print("🚢 MAERSK DEEP FEATURE VERIFICATION 🚢")
    print("=======================================")
    
    # 1. LOCATIONS
    print("\n1️⃣  TESTING LOCATION SEARCH...")
    try:
        locs = await maersk_client.search_locations("Shanghai")
        if locs:
            print(f"   ✅ SUCCESS: Found {len(locs)} locations for 'Shanghai'.")
            print(f"   📍 Sample: {locs[0].get('cityName')} ({locs[0].get('UNLocationCode')})")
        else:
            print("   ⚠️  WARNING: Location search returned empty (Simulation Fallback might be active).")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")

    # 2. VESSELS
    print("\n2️⃣  TESTING ACTIVE VESSEL FLEET...")
    try:
        vessels = await maersk_client.get_active_vessels()
        if vessels:
            print(f"   ✅ SUCCESS: Retrieved {len(vessels)} active vessels.")
            # Use correct keys found via debug
            name = vessels[0].get('vesselLongName') or vessels[0].get('vesselName')
            code = vessels[0].get('carrierVesselCode')
            print(f"   🚢 Sample: {name} (Code: {code})")
        else:
             print("   ⚠️  WARNING: Vessel list empty (Check API Key or Maersk Status).")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")

    # 3. COMMODITIES
    print("\n3️⃣  TESTING COMMODITY CLASSIFICATION...")
    try:
        # Test generic fetch
        comms = await maersk_client.get_commodities()
        if comms:
             print(f"   ✅ SUCCESS: Retrieved {len(comms)} commodity classes.")
             print(f"   📦 Sample: {comms[0].get('commodityName')}")
        else:
             print("   ⚠️  WARNING: Commodity list empty.")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")

    # 4. DEADLINES (Simulation/Logic Check)
    print("\n4️⃣  TESTING DEADLINE LOGIC...")
    try:
        # We need valid inputs to test the real API, so we'll test the METHOD presence and Simulation logic fallback
        # Real call requires valid UNLocode, IMO, Voyage from a schedule
        print("   ℹ️  Note: Real deadline fetch requires active booking/schedule context.")
        
        # Simulate a call to prove the function doesn't crash
        res = await maersk_client.get_deadlines("CNSHA", "9842102", "216E")
        if res:
             print("   ✅ SUCCESS: API responded (even if empty/mocked). logic is reachable.")
        else:
             print("   ✅ SUCCESS: Logic handled 'No Data' gracefully (Expected for dummy inputs).")
             
    except Exception as e:
        print(f"   ❌ FAILED: {e}")

    # 5. BOOKING OFFICES (Bonus)
    print("\n5️⃣  TESTING BOOKING OFFICES...")
    try:
        offices = await maersk_client.get_booking_offices("Shanghai")
        if offices:
            print(f"   ✅ SUCCESS: Found Booking Office.")
            print(f"   🏢 Name: {offices[0].get('officeName')}")
        else:
             print("   ⚠️  WARNING: No offices found.")
    except Exception as e:
         print(f"   ❌ FAILED: {e}")

    print("\n=======================================")
    print("🏁 FEATURE CHECK COMPLETE")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_maersk_features())
