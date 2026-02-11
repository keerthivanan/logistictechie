import asyncio
import httpx
import os
import base64
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

KEY = os.getenv("MAERSK_CONSUMER_KEY", "").strip()
SECRET = os.getenv("MAERSK_CONSUMER_SECRET", "").strip()
INT_ID = os.getenv("MAERSK_INTEGRATION_ID", "").strip()
BASE_URL = "https://api.maersk.com/oauth2/access_token"

async def try_auth(name, cid, csec, iid_header=None):
    print(f"\n🧪 {name} -> CID:{cid[:5]}... SEC:{csec[:5]}... IID:{iid_header}")
    async with httpx.AsyncClient() as client:
        try:
            # 1. Body Params
            resp = await client.post(
                BASE_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": cid,
                    "client_secret": csec
                },
                headers={"Content-Type": "application/x-www-form-urlencoded", **({"Integration-ID": iid_header} if iid_header else {})}
            )
            print(f"   [BODY] Status: {resp.status_code} | {resp.text[:60]}...")
            if resp.status_code == 200: return True

            # 2. Basic Auth Header
            auth_str = f"{cid}:{csec}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            resp = await client.post(
                BASE_URL,
                data={"grant_type": "client_credentials"},
                headers={
                    "Authorization": f"Basic {b64_auth}",
                    "Content-Type": "application/x-www-form-urlencoded",
                    **({"Integration-ID": iid_header} if iid_header else {})
                }
            )
            print(f"   [AUTH] Status: {resp.status_code} | {resp.text[:60]}...")
            if resp.status_code == 200: return True
            
        except Exception as e:
            print(f"   Error: {e}")
    return False

async def main():
    print("🕵️ MAERSK PERMUTATION TESTER")
    
    # 1. Standard (Key as CID)
    if await try_auth("STANDARD (Key as CID)", KEY, SECRET, INT_ID): return

    # 2. Standard No IID
    if await try_auth("STANDARD NO IID", KEY, SECRET, None): return

    # 3. Swap (Integration ID as CID?? unlikely but testing)
    if await try_auth("SWAP (IntID as CID)", INT_ID, SECRET, None): return
    
    # 4. Swap (Consumer Key as Secret??)
    if await try_auth("SWAP (Key as Secret)", INT_ID, KEY, None): return

    print("\n❌ ALL Permutations Failed.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
