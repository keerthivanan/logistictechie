
import asyncio
import sys
import os
import requests
import json

# Add backend to path so we can import app modules
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

from app.db.session import AsyncSessionLocal
from app.models.quote import Quote
from sqlalchemy import select

async def verify():
    print("\n🕵️ STARTING ZERO-TRUST VERIFICATION: QUOTE PERSISTENCE\n")
    
    # step 1: Hit API
    payload = {
        "origin": "CNSEA",
        "destination": "USLAX",
        "container": "40FT",
        "commodity": "Electronics",
        "goods_value": 50000
    }
    
    api_url = "http://localhost:8001/api/quotes/"
    print(f"🚀 Sending Quote Request to SHADOW INSTANCE [{api_url}]...")
    
    try:
        res = requests.post(api_url, json=payload, timeout=10)
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return

    if res.status_code != 200:
        print(f"❌ API Error {res.status_code}: {res.text}")
        return

    data = res.json()
    quotes = data.get("quotes", [])
    if not quotes:
        print("❌ No quotes returned from API")
        return

    # Grab the first quote (usually Prophetic or Maersk)
    target_id = quotes[0]["id"]
    print(f"✅ Received API Response: {len(quotes)} Quotes Generated.")
    print(f"🎯 Tracking Target ID: {target_id}")

    # Step 2: Check DB
    print("🔍 Querying Sovereign Ledger (Database)...")
    
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Quote).filter(Quote.id == target_id))
            quote = result.scalars().first()
            
            if quote:
                print(f"\n🏆 VICTORY: Quote {target_id} SUCCESSFULLY PERSISTED!")
                print("---------------------------------------------------")
                print(f"   📂 ID: {quote.id}")
                print(f"   🚢 Carrier: {quote.carrier_name}")
                print(f"   💰 Price: ${quote.price}")
                print(f"   🌍 Route: {quote.origin} -> {quote.destination}")
                print(f"   🧠 Source: {quote.source_endpoint}")
                print(f"   ⚡ Is Real: {quote.is_real}")
                print("---------------------------------------------------")
                print("✅ SYSTEM VERDICT: 100% OPERATIONAL & PERSISTENT.")
            else:
                print(f"\n❌ CRITICAL FAILURE: Quote {target_id} was returned by API but NOT found in DB.")
                print("⚠️  Data was potentially lost or transaction rolled back.")
                
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")
        # Print full traceback
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify())
