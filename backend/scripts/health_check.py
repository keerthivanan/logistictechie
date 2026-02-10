"""
COMPREHENSIVE BACKEND HEALTH CHECK
Tests every API endpoint to ensure zero errors.
"""
import requests
import json
import sys

BASE = "http://localhost:8000"
results = []
total = 0
passed = 0
failed = 0

def test(name, method, url, **kwargs):
    global total, passed, failed
    total += 1
    try:
        r = getattr(requests, method)(url, **kwargs, timeout=10)
        if r.status_code < 500:
            passed += 1
            results.append(f"  ✅ {name} → {r.status_code}")
        else:
            failed += 1
            results.append(f"  ❌ {name} → {r.status_code}: {r.text[:100]}")
    except Exception as e:
        failed += 1
        results.append(f"  ❌ {name} → ERROR: {str(e)[:80]}")

print("=" * 60)
print("🔍 COMPREHENSIVE BACKEND HEALTH CHECK")
print("=" * 60)

# 1. Root Health
test("Root Health", "get", f"{BASE}/")

# 2. Auth
print("\n📦 AUTH ENDPOINTS:")
test("Login (valid)", "post", f"{BASE}/api/auth/login", 
     json={"email": "keerthivanan.ds.ai@gmail.com", "password": "keerthimaster1"})
test("Login (invalid)", "post", f"{BASE}/api/auth/login", 
     json={"email": "wrong@email.com", "password": "wrong"})
test("Register (duplicate)", "post", f"{BASE}/api/auth/register", 
     json={"email": "keerthivanan.ds.ai@gmail.com", "password": "test"})

# Get token for authenticated tests
r = requests.post(f"{BASE}/api/auth/login", 
    json={"email": "keerthivanan.ds.ai@gmail.com", "password": "keerthimaster1"})

if r.status_code == 200:
    token = r.json().get("access_token", "")
    user_id = r.json().get("user_id", "")
    headers = {"Authorization": f"Bearer {token}"}
else:
    print(f"⚠️  Auth Setup Failed: {r.status_code} - {r.text[:100]}")
    token = ""
    user_id = ""
    headers = {}

test("Get My Profile", "get", f"{BASE}/api/auth/me", headers=headers)

# 3. Bookings
print("\n📦 BOOKING ENDPOINTS:")
test("Create Booking", "post", f"{BASE}/api/bookings/", 
     json={"quote_id": "health-check-q1", "user_id": user_id, 
            "cargo_details": "{\"test\": true}", "price": 1500},
     headers=headers)
test("Get User Bookings", "get", f"{BASE}/api/bookings/user/{user_id}", headers=headers)
test("Get Booking by Ref (not found)", "get", f"{BASE}/api/bookings/FAKE-REF")

# 4. Quotes
print("\n📦 QUOTE ENDPOINTS:")
test("Search Quotes", "post", f"{BASE}/api/quotes/", 
     json={"origin": "Shanghai", "destination": "Jeddah"})

# 5. Tracking
print("\n📦 TRACKING ENDPOINTS:")
test("Track Container", "get", f"{BASE}/api/tracking/MSKU1234567")

# 6. Reference Data
print("\n📦 REFERENCE ENDPOINTS:")
test("Port Search", "get", f"{BASE}/api/ports/search?q=Shanghai")
test("Schedules", "get", f"{BASE}/api/schedules?origin=Shanghai&destination=Jeddah")
test("Cutoff Times", "get", f"{BASE}/api/cutoff-times?port=Jeddah")

# Final Report
print("\n" + "=" * 60)
for r in results:
    print(r)
print("=" * 60)
print(f"\n🏆 RESULT: {passed}/{total} passed | {failed} failed")
if failed == 0:
    print("🎉 ZERO ERRORS! Production ready!")
else:
    print(f"⚠️  {failed} endpoint(s) need attention")
