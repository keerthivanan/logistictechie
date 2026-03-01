import subprocess
import time

print("Starting Uvicorn Server on 8004...")
server = subprocess.Popen(["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8004"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

time.sleep(3) # Wait for startup

print("Running stress test (WF1 isolation)...")
import httpx, asyncio, json
from datetime import datetime
SECRET = "3670f2a318c486004bd9250b80e2277dfbe1e022896bdabd5162c792df897ce6"
HEADERS = {"X-OMEGO-API-KEY": SECRET, "Content-Type": "application/json"}

async def test():
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15.0) as client:
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
            resp = await client.post("http://127.0.0.1:8004/api/request-sync", json=req_payload)
            print(f"Status: {resp.status_code}")
    except Exception as e:
        print(f"Request failed: {e}")

asyncio.run(test())

# Read output
time.sleep(1)
server.terminate()
outs, _ = server.communicate()

with open("uvicorn_logs.txt", "w", encoding="utf-8") as f:
    f.write(outs)
    
print("Logs written to uvicorn_logs.txt")
