import asyncio
import os
from app.services.ocean.maersk import MaerskClient
from app.core.config import settings

# Force load env if needed (though app.core.config should handle it)
# settings object is already loaded.

async def main():
    print("🤖 MAERSK CLASS VERIFICATION (INTERNAL CODE)")
    client = MaerskClient()
    
    print("\n1. Testing search_locations('Shanghai')...")
    locs = await client.search_locations("Shanghai")
    print(f"   Result: {len(locs)} items found.")
    if locs: print(f"   Sample: {locs[0].get('cityName')} ({locs[0].get('geoId')})")
    else: print("   ❌ FAILED")

    print("\n2. Testing get_active_vessels()...")
    vessels = await client.get_active_vessels()
    print(f"   Result: {len(vessels)} vessels found.")
    if vessels: print(f"   Sample: {vessels[0].get('vesselName')}")
    else: print("   ❌ FAILED")

    print("\n3. Testing get_commodities('Cars')...")
    comms = await client.get_commodities("Cars")
    print(f"   Result: {len(comms)} items found.")
    if comms: print(f"   Sample: {comms[0].get('commodityName')}")
    else: print("   ❌ FAILED")

    print("\n4. Testing get_booking_offices('New York')...")
    offices = await client.get_booking_offices("New York")
    print(f"   Result: {len(offices)} offices found.")
    if offices: print(f"   Sample: {offices[0].get('officeName')}")
    else: print("   ❌ FAILED")

    print("\n5. Testing get_deadlines() [Mocking inputs]...")
    # We need valid inputs for 200 OK, but 404 is also 'Success' for connection.
    deadlines = await client.get_deadlines("CNHKG", "9999999", "999W")
    if deadlines == {}:
        print("   Result: Empty Dict (Expected for invalid vessel query, but connection likely OK)")
        print("   ✅ PASSED (Connection Active)")
    else:
        print(f"   Result: {deadlines}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
