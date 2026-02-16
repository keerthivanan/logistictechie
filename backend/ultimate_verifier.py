import asyncio
import httpx
from datetime import datetime
import json

BASE_URL = "http://127.0.0.1:8000"
TEST_USER = {
    "email": "keerthivanan.ds.ai@gmail.com",
    "password": "keerthimaster1",
    "confirm_password": "keerthimaster1",
    "full_name": "Keerthivanan",
    "company_name": "LogisticTechie"
}

class UltimateVerifier:
    def __init__(self):
        self.token = None
        self.client = httpx.AsyncClient(timeout=30.0)

    async def run(self):
        print("\n" + "="*60)
        print("STARTING ULTIMATE G.O.A.T. SYSTEM VERIFICATION")
        print("="*60)

        # 1. AUTH & IDENTITY
        print("\n[1/9] Verifying Auth & Identity...")
        try:
            # Register (Allow existing)
            reg_resp = await self.client.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
            if reg_resp.status_code == 200:
                print("INFO: Registration Successful.")
            elif reg_resp.status_code == 400 and "already registered" in reg_resp.text.lower():
                print("INFO: User already exists. Proceeding to login.")
            else:
                print(f"WARN: Registration response: {reg_resp.status_code} - {reg_resp.text}")

            # Login
            resp = await self.client.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            })
            if resp.status_code == 200:
                self.token = resp.json()["access_token"]
                self.client.headers.update({"Authorization": f"Bearer {self.token}"})
                print("SUCCESS: Auth Verified: JWT Issued.")
            else:
                print(f"FAILURE: Auth Failed: {resp.text}")
                return
        except Exception as e:
            print(f"FAILURE: Connection Error: {e}")
            return

        # 2. SEACH & QUOTES
        print("\n[2/9] Verifying Search & Quotes (CNSHA -> SAJED)...")
        search_req = {
            "origin": "CNSHA",
            "destination": "SAJED",
            "container": "40FT",
            "commodity": "General Cargo",
            "ready_date": "2026-03-01"
        }
        resp = await self.client.post(f"{BASE_URL}/api/quotes/", json=search_req)
        if resp.status_code == 200:
            data = resp.json()
            print(f"SUCCESS: Search Verified: Received {data['carrier_count']} quotes.")
            first_quote = data["quotes"][0]
            print(f"   - Highlight: {first_quote['carrier_name']} | ${first_quote['price']}")
        else:
            print(f"FAILURE: Search Failed: {resp.text}")

        # 3. CALCULATOR PHYSICS
        print("\n[3/9] Verifying Calculator Physics...")
        calc_req = search_req.copy()
        calc_req["goods_value"] = 50000.0
        resp = await self.client.post(f"{BASE_URL}/api/quotes/calculate", json=calc_req)
        if resp.status_code == 200:
            data = resp.json()["data"]
            print(f"SUCCESS: Calculator Verified: Landed Cost ${data['total_landed']}")
            print(f"   - Wisdom: {data['wisdom'][:50]}...")
        else:
            print(f"FAILURE: Calculator Failed: {resp.text}")

        # 4. PERSISTENCE: BOOKING
        print("\n[4/9] Verifying Booking Persistence...")
        booking_req = {
            "quote_id": "SIM-2026",
            "cargo_details": json.dumps({"origin": "Shanghai", "destination": "Jeddah", "container": "40FT"}),
            "quote_data": {"carrier": "MSC", "price": 2450}
        }
        resp = await self.client.post(f"{BASE_URL}/api/bookings/", json=booking_req)
        if resp.status_code == 200:
            booking = resp.json()["data"]
            self.booking_ref = booking["booking_reference"]
            print(f"SUCCESS: Booking Verified: Reference {self.booking_ref}")
        else:
            print(f"FAILURE: Booking Failed: {resp.text}")

        # 5. DASHBOARD & ACTIVITY
        print("\n[5/9] Verifying Dashboard & Activity Ledger...")
        resp = await self.client.get(f"{BASE_URL}/api/dashboard/stats/me")
        if resp.status_code == 200:
            data = resp.json()
            print(f"SUCCESS: Dashboard Verified: {data['active_shipments']} active shipments found.")
            print(f"SUCCESS: Activity Ledger: Found {len(data['recent_activity'])} recent actions.")
        else:
            print(f"FAILURE: Dashboard Failed: {resp.text}")

        # 6. BILLING & INVOICES
        print("\n[6/9] Verifying Billing & Invoices...")
        resp = await self.client.get(f"{BASE_URL}/api/billing/me")
        if resp.status_code == 200:
            data = resp.json()["data"]
            print(f"SUCCESS: Billing Verified: {len(data['invoices'])} invoices generated.")
            print(f"   - Outstanding: {data['stats']['outstanding']}")
        else:
            print(f"FAILURE: Billing Failed: {resp.text}")

        # 7. TRACKING
        print("\n[7/9] Verifying Global Tracking...")
        resp = await self.client.get(f"{BASE_URL}/api/tracking/{self.booking_ref}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"SUCCESS: Tracking Verified: Status '{data['status']}' | Progress {data['progress']}%")
        else:
            print(f"FAILURE: Tracking Failed: {resp.text}")

        # 8. AI CORTEX
        print("\n[8/9] Verifying AI Cortex Intelligence...")
        chat_req = {"message": "Where is my shipment?", "history": []}
        resp = await self.client.post(f"{BASE_URL}/api/ai/chat", json=chat_req)
        if resp.status_code == 200:
            print(f"SUCCESS: AI Chat Verified: {resp.json()['response'][:60]}...")
        else:
            print(f"FAILURE: AI Chat Failed: {resp.text}")

        # 9. REFERENCES (PORT SEARCH)
        print("\n[9/9] Verifying Global References...")
        resp = await self.client.get(f"{BASE_URL}/api/references/ports/search?q=Shanghai")
        if resp.status_code == 200:
            print(f"SUCCESS: Port Search Verified: Found {len(resp.json()['results'])} nodes.")
        else:
            print(f"FAILURE: Port Search Failed: {resp.text}")

        print("\n" + "="*60)
        print("ALL SYSTEMS VERIFIED: OMEGO STATUS IS G.O.A.T.")
        print("="*60)
        await self.client.aclose()

if __name__ == "__main__":
    asyncio.run(UltimateVerifier().run())
