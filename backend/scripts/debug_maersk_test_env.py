import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

KEY = os.getenv("MAERSK_CONSUMER_KEY", "").strip()
SECRET = os.getenv("MAERSK_CONSUMER_SECRET", "").strip()
# Switch to TEST environment URL
BASE_URL = "https://test.api.maersk.com/oauth2/access_token"

async def test_maersk_test_env():
    print(f"🔑 Testing TEST ENV Credentials for Key: {KEY[:5]}...")
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                BASE_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": KEY,
                    "client_secret": SECRET
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            print(f"TEST ENV Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_maersk_test_env())
