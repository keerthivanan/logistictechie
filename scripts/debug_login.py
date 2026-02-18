
import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import app.models # Trigger registry population

from app.db.session import AsyncSessionLocal
from app.crud.user import user as user_crud
from app.core.security import verify_password
from app.models.user import User

async def debug_login():
    print("🔍 DEBUGGING LOGIN LOGIC DIRECTLY...")
    email = "keerthivanan.ds.ai@gmail.com"
    
    async with AsyncSessionLocal() as db:
        try:
            print(f"1. Fetching user: {email}")
            user = await user_crud.get_by_email(db, email=email)
            
            if not user:
                print("❌ User NOT FOUND in DB.")
                return
            
            print(f"✅ User Found: {user.id}")
            print(f"   Role: {user.role}")
            print(f"   Is Active: {user.is_active}")
            print(f"   Password Hash: {user.password_hash[:10]}...")
            
            # Check other fields that might cause 500 if missing
            print(f"   Avatar: {user.avatar_url}")
            print(f"   Locked: {user.is_locked}")
            
        except Exception as e:
            print(f"❌ EXCEPTION DURING DB LOOKUP: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    # Windows/Asyncio fix
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(debug_login())
