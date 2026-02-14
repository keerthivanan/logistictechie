import asyncio
import httpx
import sys
import json

async def goat_final_seal_audit_v4(passes=50):
    print("PHOENIX OS: G.O.A.T. FINAL SEAL AUDIT (IPv4 EXPLICIT)")
    print("====================================================")
    
    # Using 127.0.0.1 explicitly to avoid Windows IPv6/IPv4 localhost ambiguity
    BASE_URL_BE = "http://127.0.0.1:8000"
    BASE_URL_FE = "http://127.0.0.1:3000"
    
    success_count = 0
    total_points = passes * 4
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for i in range(1, passes + 1):
            if i % 10 == 0 or i == 1:
                print(f"--- PASS {i}/{passes} ---")
            
            # 1. BE HEALTH
            try:
                r = await client.get(f"{BASE_URL_BE}/health")
                if r.status_code == 200: success_count += 1
                else: print(f"   [FAIL] BE_HEALTH: {r.status_code}")
            except Exception as e: print(f"   [FAIL] BE_HEALTH: {e}")
            
            # 2. AI PERSONA & EMOJI CHECK
            try:
                payload = {"message": "Audit.", "history": [], "lang": "en"}
                r = await client.post(f"{BASE_URL_BE}/api/ai/chat?lang=en", json=payload)
                if r.status_code == 200:
                    resp = r.json().get("response", "")
                    if not any(e in resp for e in ["🚀", "🔱", "🏛", "✅"]): success_count += 1
                    else: print(f"   [FAIL] AI_EMOJI: Detected in response")
                else: print(f"   [FAIL] AI_API: {r.status_code}")
            except Exception as e: print(f"   [FAIL] AI_API: {e}")
            
            # 3. DB CONNECTIVITY
            try:
                r = await client.get(f"{BASE_URL_BE}/api/vessels/active")
                if r.status_code == 200: success_count += 1
                else: print(f"   [FAIL] DB_VESSELS: {r.status_code}")
            except Exception as e: print(f"   [FAIL] DB_VESSELS: {e}")
            
            # 4. FE ACCESSIBILITY
            try:
                r = await client.get(f"{BASE_URL_FE}/")
                if r.status_code == 200: success_count += 1
                else: print(f"   [FAIL] FE_ACCESS: {r.status_code}")
            except Exception as e: print(f"   [FAIL] FE_ACCESS: {e}")
            
            await asyncio.sleep(0.01)

    final_score = (success_count / total_points) * 100
    print("\n====================================================")
    print(f"ULTIMATE G.O.A.T. SCORE: {final_score:.2f}%")
    print("====================================================")
    if final_score >= 100: print("SYSTEM SEALED: BEST OF ALL TIME.")
    else: print(f"SYSTEM WARNING: ONLY {success_count}/{total_points} POINTS REACHED.")

if __name__ == "__main__":
    asyncio.run(goat_final_seal_audit_v4())
