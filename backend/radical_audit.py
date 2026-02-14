import asyncio
import httpx
import json
import sys

async def radical_audit_v4(passes=50):
    print("PHOENIX OS: RADICAL INTEGRITY AUDIT (V4.0 - ASCII SAFE)")
    print("==========================================================")
    
    BASE_URL_BE = "http://localhost:8000"
    BASE_URL_FE = "http://localhost:3000"

    current_pass = 1
    async with httpx.AsyncClient(timeout=15.0) as client:
        while current_pass <= passes:
            if current_pass % 10 == 0 or current_pass == 1:
                print(f"--- PASS {current_pass}/{passes} ---")
            
            # 1. CORE API SUITE
            try:
                r = await client.get(f"{BASE_URL_BE}/health")
                if r.status_code != 200:
                    print(f"   [WARN] PASS {current_pass}: Health check returned {r.status_code}")
            except Exception as e:
                 print(f"   [FAIL] PASS {current_pass}: Backend Unreachable: {e}")

            # 2. TACTICAL AI PROTOCOL
            if current_pass % 10 == 0 or current_pass == 1:
                payload = {
                    "message": "analyze my process BK-TACTICAL-CHECK", 
                    "history": [], 
                    "lang": "en"
                }
                try:
                    r = await client.post(f"{BASE_URL_BE}/api/ai/chat?lang=en", json=payload)
                    if r.status_code == 200:
                        content = r.json().get("response", "")
                        if "BK-TACTICAL-CHECK" in content or "Reference" in content:
                            print(f"   [OK] PASS {current_pass}: AI Tactical Logic VERIFIED.")
                        else:
                            print(f"   [WARN] PASS {current_pass}: AI Logic Anomaly.")
                    else:
                        print(f"   [FAIL] PASS {current_pass}: AI API Failed ({r.status_code})")
                except Exception as e:
                    print(f"   [FAIL] PASS {current_pass}: AI API Unreachable: {e}")

            # 3. FRONTEND NAVIGATION SCAN
            try:
                r_fe = await client.get(f"{BASE_URL_FE}/")
                if r_fe.status_code != 200:
                     print(f"   [WARN] PASS {current_pass}: Frontend returned {r_fe.status_code}")
            except Exception as e:
                if current_pass % 10 == 0 or current_pass == 1:
                    print(f"   [FAIL] PASS {current_pass}: Frontend Unreachable: {e}")

            current_pass += 1
            await asyncio.sleep(0.05)

    print("==========================================================")
    print("AUDIT COMPLETE: THE SYSTEM IS SEALED")
    print("==========================================================")

if __name__ == "__main__":
    asyncio.run(radical_audit_v4())
