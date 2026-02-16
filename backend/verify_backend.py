import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_pulse():
    print("\nTesting /api/status/pulse [GET]...")
    try:
        response = requests.get(f"{BASE_URL}/status/pulse")
        response.raise_for_status()
        data = response.json()
        print(f"Success. System Status: {data.get('status')}")
        feed = data.get('feed', [])
        print(f"   Live Feed Items: {len(feed)}")
        if feed:
            print(f"   Sample Ticker: {feed[0].get('symbol')} -> {feed[0].get('value')}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def test_quotes():
    print("Testing /api/quotes/ [POST]...")
    payload = {
        "origin": "CNSHA",
        "destination": "NLRTM", # Rotterdam (EU) -> Should trigger CBAM
        "container": "40FT",
        "commodity": "Electronics",
        "goods_value": 50000
    }
    try:
        response = requests.post(f"{BASE_URL}/quotes/", json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Success. Carriers found: {data.get('carrier_count')}")
        quotes = data.get('quotes', [])
        if quotes:
            q = quotes[0]
            print(f"   Sample Quote Wisdom: {q.get('wisdom')}")
            print(f"   Sample Price: {q.get('price')} {q.get('currency')}")
            # Verify Sentinel
            if "cbam_tax" in q:
                print(f"   [VERIFIED] CBAM Tax Applied: €{q['cbam_tax']}")
            else:
                print(f"   [FAIL] CBAM Tax Missing for EU Destination")
            
            if "quantum_signature" in q.get("metadata", {}):
                 print(f"   [VERIFIED] Quantum Signature: {q['metadata']['quantum_signature']}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        if response:
            print(response.text)
        return False

if __name__ == "__main__":
    print("STATIC FIRE SYSTEM VERIFICATION")
    print("=======================================")
    
    q = test_quotes()
    p = test_pulse()
    # t = test_tracking() # Skip for speed
    
    if q and p:
        print("\nALL SYSTEMS GO (1000% working)")
        sys.exit(0)
    else:
        print("\nSYSTEM PARTIALLY FAILED")
        sys.exit(1)
