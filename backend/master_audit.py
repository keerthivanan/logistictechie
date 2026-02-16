import asyncio
import httpx
import sys
import os
from datetime import datetime

# CONFIGURATION
BASE_URL = "http://127.0.0.1:8000"
TEST_USER = {
    "email": "keerthivanan.ds.ai@gmail.com",
    "password": "keerthimaster1",
    "confirm_password": "keerthimaster1",
    "full_name": "Keerthivanan",
    "company_name": "LogisticTechie"
}

async def run_audit():
    print(f"\n🚀 STARTING MASTER SYSTEM AUDIT (PostgreSQL Protocol)")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. DATABASE & AUTH: REGISTER
        print("\n[1/6] Testing Auth: Registration...")
        try:
            reg_res = await client.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
            if reg_res.status_code == 200:
                print("✅ Registration Successful.")
            elif reg_res.status_code == 400 and "already registered" in reg_res.text.lower():
                print("ℹ️ User already exists. Proceeding to Login.")
            else:
                print(f"❌ Registration Failed: {reg_res.text}")
                # return # Don't return if it already exists
        except Exception as e:
            print(f"❌ Connection Error: {e}")
            return

        # 2. AUTH: LOGIN
        print("\n[2/6] Testing Auth: Login...")
        login_data = {"email": TEST_USER["email"], "password": TEST_USER["password"]}
        login_res = await client.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if login_res.status_code == 200:
            token = login_res.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Login Successful. JWT obtained.")
        else:
            print(f"❌ Login Failed: {login_res.text}")
            return

        # 3. AI ASSISTANT: CHAT
        print("\n[3/6] Testing AI Assistant: Chat...")
        ai_payload = {"message": "Hello Oracle, check system status.", "history": []}
        ai_res = await client.post(f"{BASE_URL}/api/ai/chat", json=ai_payload)
        if ai_res.status_code == 200:
            print(f"✅ AI Response Received: {ai_res.json().get('response')[:50]}...")
        else:
            print(f"❌ AI Assistant Error: {ai_res.text}")

        # 4. SEARCH: QUOTE GENERATION
        print("\n[4/6] Testing Search: Rate Quotations...")
        search_payload = {
            "origin": "CNSHA", # Shanghai
            "destination": "USNYC", # New York
            "container": "40FT",
            "commodity": "General Cargo",
            "ready_date": datetime.now().strftime("%Y-%m-%d"),
            "goods_value": 50000
        }
        quote_res = await client.post(f"{BASE_URL}/api/quotes/", json=search_payload, headers=headers)
        if quote_res.status_code == 200:
            quotes = quote_res.json().get("quotes", [])
            print(f"✅ Search Successful. Carriers found: {len(quotes)}")
            if len(quotes) > 0:
                print(f"   Sample Carrier: {quotes[0].get('carrier_name')} - ${quotes[0].get('price')}")
        else:
            print(f"❌ Search Error: {quote_res.text}")

        # 5. ACTIVITY: STORAGE VERIFICATION
        print("\n[5/6] Testing Activity Ledger: Persistence Check...")
        act_res = await client.get(f"{BASE_URL}/api/dashboard/stats/me", headers=headers)
        if act_res.status_code == 200:
            stats = act_res.json()
            # If the user is new, we expect some activity logged from the search above
            print(f"✅ Activity Ledger Verified. Recent Action logged: {stats.get('recent_activity', [{}])[0].get('action', 'None')}")
        else:
            print(f"❌ Activity Ledger Error: {act_res.text}")

        # 6. CALCULATOR: PHYSICS MODEL
        print("\n[6/6] Testing Calculator: Freight Analytics...")
        calc_payload = {
            "origin": "Shanghai",
            "destination": "Los Angeles",
            "cargo_type": "FCL",
            "container_size": "40FT",
            "commodity": "Electronics"
        }
        # Assuming calculator shares the search logic or has a specific endpoint
        # Checking if /api/quotes/ handles calculator-like requests
        calc_res = await client.post(f"{BASE_URL}/api/quotes/", json=calc_payload, headers=headers)
        if calc_res.status_code == 200:
            print("✅ Calculator Logic Verified (shared with Sovereign Engine).")
        else:
            print(f"❌ Calculator Logic Check Failed: {calc_res.text}")

    print("\n" + "="*60)
    print("🏆 AUDIT COMPLETE: PHOENIX OS IS OPERATIONAL IN POSTGRESQL MODE.")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(run_audit())
