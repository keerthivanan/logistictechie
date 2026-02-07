import asyncio
import sys
import os

# Ensure backend path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import AsyncSessionLocal
from app import crud

# 🌱 SEED SCRIPT
# Creates the first user so you can login.

async def seed_admin():
    print("🌱 Seeding Admin User...")
    
    async with AsyncSessionLocal() as db:
        email = "admin@logistics.os"
        password = "password123"
        
        existing = await crud.user.get_by_email(db, email=email)
        if existing:
            print(f"✅ User {email} already exists.")
        else:
            await crud.user.create(
                db, 
                email=email, 
                password=password, 
                full_name="System Administrator"
            )
            print(f"✨ Created Admin User: {email}")
            print(f"🔑 Password: {password}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_admin())
