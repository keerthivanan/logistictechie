import httpx
import asyncio
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_endpoint(client, method, path, **kwargs):
    try:
        if method == "GET":
            response = await client.get(f"{BASE_URL}{path}", **kwargs)
        elif method == "POST":
            response = await client.post(f"{BASE_URL}{path}", **kwargs)
        else:
            return "SKIPPED", method
            
        status = response.status_code
        try:
            data = response.json()
            integrity = "JSON_VALID"
        except:
            integrity = f"NON_JSON: {response.text[:100]}"
            
        return status, integrity
    except Exception as e:
        return "ERROR", str(e)

async def run_audit():
    async with httpx.AsyncClient(timeout=10.0) as client:
        print("🚀 OMEGO ENDPOINT LIVE-FIRE VERIFICATION INITIATED")
        print("-" * 50)
        
        tests = [
            ("GET", "/health", "Health Check"),
            ("GET", "/", "Root Alias"),
            ("GET", "/api/references/ports/search?q=Jeddah", "Port Search"),
            ("GET", "/api/references/vessels/active", "Vessel Fleet"),
            ("GET", "/api/references/market/indices", "Market Indices"),
            ("GET", "/api/forwarders/active", "Active Partner List"),
            ("GET", "/api/dashboard/market-ticker", "Market Ticker (n8n)"),
            ("POST", "/api/dashboard/leads", "Lead Capture Portal"),
        ]
        
        results = []
        for method, path, name in tests:
            status, integrity = await test_endpoint(client, method, path, json={} if method == "POST" else None)
            results.append({
                "name": name,
                "method": method,
                "path": path,
                "status": status,
                "integrity": integrity
            })
            print(f"[{status}] {method} {path} -> {name} | {integrity}")

        print("-" * 50)
        print("✅ VERIFICATION COMPLETE")
        
        with open("endpoint_verification_results.json", "w") as f:
            json.dump(results, f, indent=4)

if __name__ == "__main__":
    try:
        asyncio.run(run_audit())
    except Exception as e:
        print(f"Audit Crash: {e}")
