import httpx
import asyncio
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"
SECRET = "OMEGO_SUPER_SECRET_KEY_2026"

HEADERS = {
    "X-OMEGO-API-KEY": SECRET,
    "Content-Type": "application/json"
}

async def verify_n8n_flow():
    async with httpx.AsyncClient(headers=HEADERS, timeout=15.0) as client:
        print("\n[*] OMEGO-N8N INTEGRATION STRESS-TEST\n" + "="*40)
        
        # Helper to handle responses
        def print_resp(name, resp):
            print(f"[{resp.status_code}] {name}")
            try:
                print(f"   Response: {json.dumps(resp.json(), indent=2)}")
            except:
                print(f"   Raw Text: {resp.text[:500]}")

        # 1. TEST: Request Sync (WF1)
        req_id = f"TEST-REQ-{datetime.now().strftime('%M%S')}"
        req_payload = {
            "request_id": req_id,
            "user_sovereign_id": "OMEGO-TEST-01",
            "user_email": "test@omego.online",
            "user_name": "Test Shipper",
            "origin": "Shanghai",
            "destination": "Jeddah",
            "cargo_type": "FCL",
            "weight_kg": 15000.0,
            "status": "OPEN",
            "submitted_at": datetime.utcnow().isoformat() + "Z"
        }
        
        print(f"📡 [WF1] Syncing Request: {req_id}...")
        resp = await client.post(f"{BASE_URL}/api/request-sync", json=req_payload)
        print_resp("WF1 Sync", resp)
        await asyncio.sleep(0.5)

        # 2. TEST: Quote Sync (WF2)  
        # if resp.status_code < 400:
        #     quote_id = f"Q-{datetime.now().strftime('%M%S')}"
        #     quote_payload = {
        #         "quotation_id": quote_id,
        #         "request_id": req_id,
        #         "forwarder_id": "REG-TEST-FWD",
        #         "forwarder_email": "partner@omego.online",
        #         "forwarder_company": "Oceanic Logistics",
        #         "price": 2450.50,
        #         "currency": "USD",
        #         "transit_days": 18,
        #         "carrier": "Maersk",
        #         "summary": "Verified A+ Rate for Sovereign Mirror.",
        #         "status": "ACTIVE",
        #         "received_at": datetime.utcnow().isoformat() + "Z"
        #     }
        #     
        #     print(f"💎 [WF2] Syncing Quote: {quote_id}...")
        #     resp = await client.post(f"{BASE_URL}/api/quotations/new", json=quote_payload)
        #     print_resp("WF2 Sync", resp)
        #     await asyncio.sleep(0.5)

        # 3. TEST: Forwarder Save (Management)
        # f_payload = {
        #     "company_name": "Sovereign Partners Ltd",
        #     "email": "partner@sovereign.net",
        #     "country": "Saudi Arabia",
        #     "whatsapp": "+966500000000",
        #     "status": "ACTIVE",
        #     "is_verified": True
        # }
        # print(f"🤝 [MGMT] Guarding Partner Registration...")
        # resp = await client.post(f"{BASE_URL}/api/forwarders/save", json=f_payload)
        # print_resp("Partner Save", resp)
        # await asyncio.sleep(0.5)

        # 4. TEST: Request Close (WF3)
        # if req_id:
        #     close_payload = {
        #         "request_id": req_id,
        #         "status": "CLOSED",
        #         "closed_reason": "3_QUOTE_LIMIT_MET"
        #     }
        #     print(f"🔒 [WF3] Closing Request Loop: {req_id}...")
        #     resp = await client.post(f"{BASE_URL}/api/requests/close", json=close_payload)
        #     print_resp("WF3 Close", resp)

        print("\n🚀 FINAL VERIFICATION: Validating Mirror Persistence...")
        # Verify persistence via public GET
        check_resp = await client.get(f"{BASE_URL}/api/marketplace/request/{req_id}")
        if check_resp.status_code == 200:
            data = check_resp.json()
            req_data = data.get("request", {})
            if req_data.get("status") == "CLOSED":
                print("✅ PERSISTENCE VALIDATED: Mirror matches n8n state perfectly.")
            else:
                print(f"❌ PERSISTENCE FAILURE: Expected CLOSED, got {req_data.get('status')}")
        else:
            print(f"❌ FINAL CHECK FAILED: Status {check_resp.status_code}")

if __name__ == "__main__":
    asyncio.run(verify_n8n_flow())
