import httpx
import asyncio
import json

async def test_ai_diagnostic():
    print("🚀 PHOENIX AI DIAGNOSTIC - INITIALIZING VERIFICATION...")
    base_url = "http://localhost:8000"
    
    # 1. Test Health Check
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{base_url}/health")
            print(f"Health Status: {resp.status_code} | {resp.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return

    # 2. Test Non-Streaming Chat
    print("\n[AI CHECK] Testing Non-Streaming Oracle Response...")
    payload = {
        "message": "Analyze the route from Shanghai to Dubai.",
        "history": [],
        "context": {"user_email": "keerthivanan.ds.ai@gmail.com"}
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{base_url}/api/ai/chat", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                print("✅ Non-Streaming Success")
                print(f"Response Snippet: {data['response'][:100]}...")
            else:
                print(f"❌ Non-Streaming Error: {resp.status_code} | {resp.text}")
    except Exception as e:
        print(f"❌ Non-Streaming Request Failure: {e}")

    # 3. Test Proprietary Prediction Logic
    print("\n[AI CHECK] Testing Predictive Pricing Logic...")
    pred_payload = {
        "origin": "CNSHA",
        "destination": "AEDXB",
        "price": 2400.0
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{base_url}/api/ai/predict", json=pred_payload)
            if resp.status_code == 200:
                print("✅ Predictive Pricing Success")
                print(f"Result: {resp.json()['data']['recommendation']} | Logic: {resp.json()['data']['logic']}")
            else:
                print(f"❌ Prediction Error: {resp.status_code}")
    except Exception as e:
        print(f"❌ Prediction Failure: {e}")

    print("\n💯 FINAL DIAGNOSTIC COMPLETE.")

if __name__ == "__main__":
    asyncio.run(test_ai_diagnostic())
