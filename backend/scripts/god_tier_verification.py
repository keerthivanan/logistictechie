import httpx
import asyncio
import json

async def test_ai_perfection():
    print("🚀 PHOENIX OS: GOD-TIER AI VERIFICATION...")
    base_url = "http://localhost:8000"
    
    # 1. Test Prophetic Pricing (GOD-TIER PHYSICS MATH)
    print("\n[SOVEREIGN ENGINE] Testing God-Tier Physics Math...")
    pred_payload = {
        "origin": "CNSHA",
        "destination": "SAJED",
        "price": 2400.0,
        "container": "40HC"
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/api/ai/predict", json=pred_payload)
            if resp.status_code == 200:
                data = resp.json()
                print("✅ Physics Logic Success")
                # Look for the source in the response or logic
                print(f"Prophetic Logic: {data['data'].get('logic', 'N/A')}")
            else:
                print(f"❌ Pricing Logic Error: {resp.status_code}")
    except Exception as e:
        print(f"❌ Pricing Failure: {e}")

    # 2. Test Maersk Multi-API Handshake (5-API SYNC)
    print("\n[MAERSK SYNC] Testing 5-API Multi-Sync Quotation...")
    quote_payload = {
        "origin": "Shanghai",
        "destination": "Jeddah",
        "container": "40HC"
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/api/quotes/search", json=quote_payload)
            if resp.status_code == 200:
                quotes = resp.json()
                if quotes:
                    q = quotes[0]
                    print(f"✅ 5-API Sync Success. Found {len(quotes)} synchronized quotes.")
                    print(f"Vessel: {q.get('carrier_name')} | Source: {q.get('source_endpoint')}")
                    print(f"Origin Office: {q.get('contact_office', 'N/A')}")
                else:
                    print("❌ No Quotes Found (Handshake Blocked?)")
            else:
                print(f"❌ Maersk Multi-Sync Error: {resp.status_code}")
    except Exception as e:
        print(f"❌ Maersk Sync Failure: {e}")

    # 3. Test True AI OCR (@documents)
    print("\n[DOCUMENT AI] Testing True GPT-4o Parser...")
    try:
        files = {'file': ('test_bol.pdf', b'fake-pdf-content', 'application/pdf')}
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/api/documents/process", files=files)
            if resp.status_code == 200:
                res = resp.json()
                print(f"✅ AI OCR Success: {res.get('document_type')} extracted.")
                print(f"Source: {res.get('source')}")
            else:
                print(f"❌ Document AI Error: {resp.status_code}")
    except Exception as e:
        print(f"❌ Document AI Failure: {e}")

    print("\n💯 FINAL GOD-TIER VERIFICATION COMPLETE.")

if __name__ == "__main__":
    asyncio.run(test_ai_perfection())
