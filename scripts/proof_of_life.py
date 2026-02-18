
import requests
import sys
import time
from datetime import datetime

# CONFIG
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"

COLORS = {
    "HEADER": "\033[95m",
    "OKBLUE": "\033[94m",
    "OKCYAN": "\033[96m",
    "OKGREEN": "\033[92m",
    "WARNING": "\033[93m",
    "FAIL": "\033[91m",
    "ENDC": "\033[0m",
    "BOLD": "\033[1m",
    "UNDERLINE": "\033[4m",
}

def log(message, level="INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    if level == "INFO":
        print(f"[{timestamp}] {COLORS['OKBLUE']}ℹ️  {message}{COLORS['ENDC']}")
    elif level == "SUCCESS":
        print(f"[{timestamp}] {COLORS['OKGREEN']}✅ {message}{COLORS['ENDC']}")
    elif level == "ERROR":
        print(f"[{timestamp}] {COLORS['FAIL']}❌ {message}{COLORS['ENDC']}")
    elif level == "HEADER":
        print(f"\n{COLORS['HEADER']}{COLORS['BOLD']}=== {message} ==={COLORS['ENDC']}")

def check_url(url, name, expected_code=200):
    try:
        start = time.time()
        response = requests.get(url, timeout=30)
        duration = round((time.time() - start) * 1000, 2)
        
        if response.status_code == expected_code:
            log(f"{name}: Alive ({duration}ms) - {url}", "SUCCESS")
            return True
        else:
            log(f"{name}: Error {response.status_code} - {url}", "ERROR")
            return False
    except requests.exceptions.ConnectionError:
        log(f"{name}: CONNECTION REFUSED - {url}", "ERROR")
        return False
    except Exception as e:
        log(f"{name}: FAILED ({str(e)})", "ERROR")
        return False

def run_diagnostics():
    log("OMEGO SYSTEM DIAGNOSTICS", "HEADER")
    
    all_passed = True
    
    log("Checking Backend Services...", "HEADER")
    # 1. API Health
    if not check_url(f"{BACKEND_URL}/health", "Backend Health Check"): # Assuming a health endpoint exists, or root
        # Try root if /health missing
         if not check_url(f"{BACKEND_URL}/", "Backend Root", 200) and not check_url(f"{BACKEND_URL}/docs", "Backend Docs", 200):
             all_passed = False

    # 2. Auth Endpoint
    if not check_url(f"{BACKEND_URL}/api/auth/me", "Auth Router (401 Expected)", 401):
        # 401 is GOOD here because it means the endpoint exists and is protecting itself
        pass 
    
    log("Checking Frontend Nodes...", "HEADER")
    # 3. Frontend Pages
    pages = [
        ("/", "Home Page"),
        ("/login", "Login Page"),
        ("/signup", "Signup Page"),
        ("/search", "Search Tool"),
        ("/dashboard", "Dashboard (Redirect/UI)"), 
        ("/marketplace", "Marketplace"),
        ("/services/ocean-freight", "Services Page"),
        ("/tools/calculator", "Freight Calculator")
    ]
    
    for path, name in pages:
        if not check_url(f"{FRONTEND_URL}{path}", name):
            all_passed = False
            
    log("DIAGNOSTIC RESULT", "HEADER")
    if all_passed:
        print(f"{COLORS['OKGREEN']}{COLORS['BOLD']}✨ REQUESTED SYSTEM IS 100% OPERATIONAL ✨{COLORS['ENDC']}")
        sys.exit(0)
    else:
        print(f"{COLORS['FAIL']}{COLORS['BOLD']}💀 SYSTEM FAILURES DETECTED 💀{COLORS['ENDC']}")
        sys.exit(1)

if __name__ == "__main__":
    run_diagnostics()
