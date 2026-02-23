
import requests
import uuid
import sys

BACKEND_URL = "http://localhost:8000"

def test_social_sync():
    print("🤖 TESTING SOCIAL SYNC PROTOCOL...")
    
    # Generate random identity
    social_id = str(uuid.uuid4())[:8]
    test_email = f"google_user_{social_id}@example.com"
    test_name = f"Google User {social_id}"
    
    print(f"📧 Sending Identity: {test_email}")
    
    payload = {
        "email": test_email,
        "name": test_name,
        "provider": "google",
        "image": "https://lh3.googleusercontent.com/a/mock_avatar"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/api/auth/social-sync", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS: Backend accepted identity.")
            print(f"🔑 Token Issued: {data['access_token'][:20]}...")
            print(f"👤 User Name: {data['user_name']}")
            print(f"🆔 User ID: {data['user_id']}")
            
            # Verify Profile is retrievable
            print("🔍 Verifying Session...")
            headers = {"Authorization": f"Bearer {data['access_token']}"}
            me_res = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers)
            
            if me_res.status_code == 200:
                print("✅ SUCCESS: Token is valid. Session active.")
                print("🚀 GOOGLE AUTH BACKEND IS 100% OPERATIONAL.")
                sys.exit(0)
            else:
                print(f"❌ ERROR: Token failed validation. {me_res.text}")
                sys.exit(1)
                
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    test_social_sync()
