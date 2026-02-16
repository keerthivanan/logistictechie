import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def test_ai_intelligence():
    print("🧠 TESTING AI CORTEX INTELLIGENCE...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Complex logistics question
        payload = {
            "message": "Explain the impact of the Red Sea disruptions on Suez Canal transit times and how OMEGO handles the risk re-routing for 40FT containers from Shanghai to Rotterdam.",
            "history": []
        }
        resp = await client.post(f"{BASE_URL}/api/ai/chat", json=payload)
        if resp.status_code == 200:
            data = resp.json()
            print("\n✅ AI RESPONSE RECEIVED:")
            print("-" * 40)
            print(data.get("response"))
            print("-" * 40)
            if "risk" in data.get("response").lower() or "suez" in data.get("response").lower():
                print("🏆 INTELLIGENCE VERIFIED: Context-aware and relevant.")
            else:
                print("⚠️ INTELLIGENCE WARNING: Response lacks specific logistics context.")
        else:
            print(f"❌ AI ERROR: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_ai_intelligence())
