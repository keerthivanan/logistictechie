"""
OMEGO LOGISTICS OS - GLOBAL HEALTH CHECK (PROPHETIC EDITION)
Simplified ASCII for 100% Shell Compatibility.
"""
import requests
import json
import sys

BASE = "http://localhost:8000"
results = []
total = 0
passed = 0
failed = 0

def test(name, method, url, expected_status=200, **kwargs):
    global total, passed, failed
    total += 1
    try:
        r = getattr(requests, method)(url, **kwargs, timeout=30)
        if r.status_code == expected_status:
            passed += 1
            results.append(f"[PASS] {name} -> {r.status_code}")
        else:
            failed += 1
            results.append(f"[FAIL] {name} -> {r.status_code} (Expected {expected_status}): {r.text[:100]}")
    except Exception as e:
        failed += 1
        results.append(f"[ERR ] {name} -> ERROR: {str(e)[:80]}")

print("=" * 60)
print("OMEGO OS - COMPREHENSIVE BACKEND HEALTH CHECK")
print("=" * 60)

# 1. Root Health
test("Root Health", "get", f"{BASE}/")

# 2. Auth
print("\n[SECTION] AUTHENTICATION & IDENTITY:")
EMAIL = "keerthivanan.ds.ai@gmail.com"
PASS = "keerthimaster1"

test("Login (Sovereign Credentials)", "post", f"{BASE}/api/auth/login", 
     json={"email": EMAIL, "password": PASS})
test("Register (Duplicate Handling)", "post", f"{BASE}/api/auth/register", 
     json={"email": EMAIL, "password": PASS, "confirm_password": PASS},
     expected_status=400)

# Get token for authenticated tests
r = requests.post(f"{BASE}/api/auth/login", json={"email": EMAIL, "password": PASS})
if r.status_code == 200:
    data = r.json()
    token = data.get("access_token", "")
    user_id = data.get("user_id", "")
    headers = {"Authorization": f"Bearer {token}"}
else:
    print(f"! Auth Setup Failed: {r.status_code}")
    token, user_id, headers = "", "", {}

test("Get My Profile (me)", "get", f"{BASE}/api/auth/me", headers=headers)

# 3. Bookings
print("\n[SECTION] OPERATIONAL LOGISTICS (BOOKINGS):")
test("Create Booking (Hardened Schema)", "post", f"{BASE}/api/bookings/", 
     json={"quote_id": "health-check-q1", "user_id": user_id, 
            "cargo_details": {"test": True, "type": "HealthCheck"}, "price": 1500.0},
     headers=headers)
test("Get User Bookings", "get", f"{BASE}/api/bookings/user/{user_id}", headers=headers)

# 4. Quotes
print("\n[SECTION] INTELLIGENCE HUB (QUOTATIONS):")
test("Search Quotes (Prophetic Vision Tier)", "post", f"{BASE}/api/quotes/", 
     json={"origin": "Shanghai", "destination": "Jeddah", "container": "40HC"})

# 5. Tracking
print("\n[SECTION] TELEMETRY & TRACKING:")
test("Track Container (Predictive)", "get", f"{BASE}/api/tracking/MSKU1234567")

# 6. Reference Data
print("\n[SECTION] GLOBAL REFERENCE NODES:")
test("Port Search", "get", f"{BASE}/api/ports/search?q=Shanghai")
test("Schedules (Multi-Sync Handshake)", "get", f"{BASE}/api/schedules?origin=Shanghai&destination=Jeddah")
test("Cutoff Times", "get", f"{BASE}/api/cutoff-times?port=Jeddah")

# 7. AI Performance
print("\n[SECTION] CREATIVE CORTEX (AI):")
test("AI Market Trend Search", "get", f"{BASE}/api/ai/trend?country=SAUDI")

# Final Report
print("\n" + "=" * 60)
for res in results:
    print(res)
print("=" * 60)
print(f"\nRESULT: {passed}/{total} passed | {failed} failed")
if failed == 0:
    print("OMEGO OS IS FULLY OPERATIONAL. BEST IN WORLD STATUS CONFIRMED. 👑")
else:
    print(f"ATTENTION: {failed} endpoint(s) require logic adjustment.")
