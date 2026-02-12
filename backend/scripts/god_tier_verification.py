import httpx
import asyncio
import json

async def test_ai_perfection():
    print("🚀 PHOENIX OS: GOD-TIER AI VERIFICATION...")
    base_url = "http://localhost:8000"
    
    # 1. Test Prophetic Pricing (LLM-POWERED)
    print("\n[AI ORACLE] Testing Prophetic Pricing Analysis...")
    pred_payload = {
        "origin": "CNSHA",
        "destination": "AEDXB",
        "price": 2400.0
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/api/ai/predict", json=pred_payload)
            if resp.status_code == 200:
                data = resp.json()["data"]
                print("✅ Prophetic Success")
                print(f"Prediction: {data['prediction']}")
                print(f"Recommendation: {data['recommendation']}")
                print(f"Prophetic Logic: {data['logic']}")
                print(f"Confidence: {data['confidence']}")
            else:
                print(f"❌ Prediction Error: {resp.status_code} | {resp.text}")
    except Exception as e:
        print(f"❌ Prediction Failure: {e}")

    # 2. Test Maersk Location Sync
    print("\n[MAERSK SYNC] Testing Reference Data Handshake...")
    try:
        async with httpx.AsyncClient() as client:
            # Corrected URI: main.py mounts references.router at /api
            resp = await client.get(f"{base_url}/api/ports/search?q=Shanghai")
            if resp.status_code == 200:
                print(f"✅ Maersk Sync Success. Found {len(resp.json()['results'])} locations.")
            else:
                print(f"❌ Maersk Sync Error: {resp.status_code} | {resp.text}")
    except Exception as e:
        print(f"❌ Maersk Sync Failure: {e}")

    print("\n💯 FINAL GOD-TIER VERIFICATION COMPLETE.")

if __name__ == "__main__":
    asyncio.run(test_ai_perfection())
