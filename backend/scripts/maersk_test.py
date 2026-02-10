"""
MAERSK API LIVE CONNECTIVITY TEST
Tests all 5 enabled APIs against real Maersk endpoints.
"""
import requests
import json

BASE = "http://localhost:8000"
results = []
total = 0
passed = 0
warnings = 0

def test_api(name, url, expect_data_key=None):
    global total, passed, warnings
    total += 1
    try:
        r = requests.get(url, timeout=10)
        data = r.json()
        
        if r.status_code == 200:
            # Check if we got real data
            if expect_data_key and data.get(expect_data_key):
                items = data[expect_data_key]
                count = len(items) if isinstance(items, list) else 1
                passed += 1
                results.append(f"  ✅ {name} → {r.status_code} | {count} results")
            elif expect_data_key:
                warnings += 1
                results.append(f"  ⚠️  {name} → {r.status_code} | Empty response (API key may not have access)")
            else:
                passed += 1
                results.append(f"  ✅ {name} → {r.status_code}")
        else:
            warnings += 1
            results.append(f"  ⚠️  {name} → {r.status_code}")
    except Exception as e:
        warnings += 1
        results.append(f"  ❌ {name} → ERROR: {str(e)[:80]}")

print("=" * 65)
print("🚢 MAERSK API LIVE CONNECTIVITY TEST")
print("=" * 65)

# 1. Locations API
test_api(
    "Locations (Port Search: Shanghai)",
    f"{BASE}/api/ports/search?q=Shanghai",
    "results"
)

# 2. Vessels API
test_api(
    "Vessels (Active Fleet)",
    f"{BASE}/api/vessels/active",
    "vessels"
)

# 3. Commodities API
test_api(
    "Commodities (Search: Electronics)",
    f"{BASE}/api/commodities/search?q=Electronics",
    "results"
)

# 4. Booking Offices API
test_api(
    "Booking Offices (Search: Dubai)",
    f"{BASE}/api/offices/search?q=Dubai",
    "data"
)

# 5. Schedules (Backend Intelligence)
test_api(
    "Schedules (Shanghai → Jeddah)",
    f"{BASE}/api/schedules?origin=Shanghai&destination=Jeddah",
    "schedules"
)

# 6. Cutoff Times
test_api(
    "Cutoff Times (Jeddah)",
    f"{BASE}/api/cutoff-times?port=Jeddah",
    "cutoffs"
)

# Final Report
print()
for r in results:
    print(r)
print()
print("=" * 65)
print(f"🏆 {passed}/{total} APIs returning data | {warnings} warnings")
if warnings == 0:
    print("🎉 ALL MAERSK APIs CONNECTED & RETURNING DATA!")
else:
    print("⚠️  Some APIs returned empty (check API key permissions)")
print("=" * 65)
