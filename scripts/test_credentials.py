
import requests
import sys

BACKEND_URL = "http://localhost:8000"
EMAIL = "keerthivanan.ds.ai@gmail.com"
PASSWORD = "keerthimaster1"

def test_credentials():
    print(f"🔐 TESTING CREDENTIALS FOR: {EMAIL}")
    
    payload = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    try:
        # 1. Try Login
        print("1️⃣  Attempting Login...")
        response = requests.post(f"{BACKEND_URL}/api/auth/login", json=payload)
        
        if response.status_code == 200:
            print("✅ LOGIN SUCCESS!")
            print(f"   Token: {response.json()['access_token'][:15]}...")
            return
            
        print(f"⚠️  Login Failed ({response.status_code}): {response.text}")
        
        # 2. If Login failed, maybe user doesn't exist? Try Registering?
        # But wait, if they want to be a 'Google User', they shouldn't register with password usually.
        # But let's check if the user exists at all via social sync simulation (which usually gets or creates).
        
        print("\n2️⃣  Checking via Social Sync (Simulation)...")
        social_payload = {
            "email": EMAIL,
            "name": "Keerthivanan Master",
            "provider": "google",
            "image": "https://lh3.googleusercontent.com/master_avatar"
        }
        res_social = requests.post(f"{BACKEND_URL}/api/auth/social-sync", json=social_payload)
        
        if res_social.status_code == 200:
             print("✅ SOCIAL SYNC SUCCESS! (Account can be created/accessed via Google Button)")
             print(f"   Note: This account is set up for Google Auth, not necessarily Password login.")
        else:
             print(f"❌ Social Sync Failed ({res_social.status_code}): {res_social.text}")

    except Exception as e:
        print(f"❌ SYSTEM ERROR: {str(e)}")

def register_and_retry():
    print(f"\n3️⃣  User might not exist. Registering {EMAIL}...")
    reg_payload = {
        "email": EMAIL,
        "password": PASSWORD,
        "confirm_password": PASSWORD,
        "full_name": "Keerthivanan Master",
        "company_name": "DS AI Logistics"
    }
    try:
        res = requests.post(f"{BACKEND_URL}/api/auth/register", json=reg_payload)
        if res.status_code == 200 or res.status_code == 201:
            print("✅ REGISTRATION SUCCESS!")
            test_credentials() # Retry login
        else:
            print(f"❌ Registration Failed ({res.status_code}): {res.text}")
    except Exception as e:
        print(f"❌ REGISTRATION ERROR: {str(e)}")

if __name__ == "__main__":
    # Modify test_credentials to call register_and_retry on 401
    print(f"🔐 TESTING CREDENTIALS FOR: {EMAIL}")
    payload = {"email": EMAIL, "password": PASSWORD}
    try:
        print("1️⃣  Attempting Login...")
        response = requests.post(f"{BACKEND_URL}/api/auth/login", json=payload)
        
        if response.status_code == 200:
            print("✅ LOGIN SUCCESS!")
            print(f"   Token: {response.json()['access_token'][:15]}...")
            sys.exit(0)
            
        print(f"⚠️  Login Failed ({response.status_code}): {response.text}")
        
        if response.status_code == 401:
            register_and_retry()
            
    except Exception as e:
        print(f"❌ SYSTEM ERROR: {str(e)}")
