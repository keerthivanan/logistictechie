import asyncio
import httpx
import base64
import os
from dotenv import load_dotenv

# Load .env manually to be 100% sure
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

KEY = os.getenv("MAERSK_CONSUMER_KEY", "").strip()
SECRET = os.getenv("MAERSK_CONSUMER_SECRET", "").strip()
BASE_URL = "https://api.maersk.com/oauth2/access_token"

async def test_maersk_auth():
    print(f"🔑 Testing Credentials for Key: {KEY[:5]}...")
    integration_id = os.getenv("MAERSK_INTEGRATION_ID", "").strip() or ""
    print(f"🆔 Integration ID: {integration_id}")

    # 1. METHOD A: BODY PARAMS (Prod)
    print("\n[1] METHOD A: Client Credentials in BODY + Integration-ID")
    headers_a = {"Content-Type": "application/x-www-form-urlencoded"}
    if integration_id:
        headers_a["Integration-ID"] = integration_id
        
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                BASE_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": KEY,
                    "client_secret": SECRET
                },
                headers=headers_a
            )
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

    # 2. METHOD B: BASIC AUTH HEADER (Prod)
    print("\n[2] METHOD B: Basic Auth + Integration-ID")
    auth_str = f"{KEY}:{SECRET}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()
    headers_b = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    if integration_id:
        headers_b["Integration-ID"] = integration_id

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                BASE_URL,
                data={"grant_type": "client_credentials"},
                headers=headers_b
            )
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_maersk_auth())
