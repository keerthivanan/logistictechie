
import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.ocean.maersk import maersk_client

async def sync_maersk_resources():
    print("🔄 SYNCING MAERSK RESOURCES FROM DOCUMENT CACHE...")
    doc_path = os.path.join(os.getcwd(), 'document')
    
    # 1. SYNC VESSELS
    vessels_file = os.path.join(doc_path, 'vessels-api.json')
    if os.path.exists(vessels_file):
        try:
            with open(vessels_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # DEBUG STRUCTURE
                if isinstance(data, dict):
                    print(f"   ℹ️  Vessels Keys: {list(data.keys())}")
                    vessels = data.get("vessels", [])
                else:
                    vessels = data
                
                print(f"   ✅ LOADED: {len(vessels)} vessels from cache.")
                
                if vessels:
                    sample = vessels[0]
                    print(f"   🚢 Sample: {sample.get('vesselName', 'UNK')} (IMO: {sample.get('vesselIMONumber', 'UNK')})")
        except Exception as e:
            print(f"   ❌ ERROR reading vessels-api.json: {e}")

    # 2. SYNC COMMODITIES
    comm_file = os.path.join(doc_path, 'commodities-reference-service.json')
    if os.path.exists(comm_file):
        try:
            with open(comm_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    print(f"   ℹ️  Commodities Keys: {list(data.keys())}")
                    comms = data.get("commodities", [])
                else:
                    comms = data
                print(f"   ✅ LOADED: {len(comms)} commodities from cache.")
        except Exception as e:
            print(f"   ❌ ERROR reading commodities-reference-service.json: {e}")

    # 3. SYNC LOCATIONS
    loc_file = os.path.join(doc_path, 'locations-api.json')
    if os.path.exists(loc_file):
        try:
            with open(loc_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    print(f"   ℹ️  Locations Keys: {list(data.keys())}")
                    locs = data.get("locations", [])
                else:
                    locs = data
                print(f"   ✅ LOADED: {len(locs)} locations from cache.")
        except Exception as e:
             print(f"   ❌ ERROR reading locations-api.json: {e}")
        
    print("\n🏁 RESOURCE SYNC CHECK COMPLETE")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(sync_maersk_resources())
