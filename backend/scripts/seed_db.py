import asyncio
import sys
from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from sqlalchemy import select

async def seed_admin():
    print("🌱 SEEDING ADMIN ACCOUNT...")
    async with AsyncSessionLocal() as db:
        # Check if admin exists
        result = await db.execute(select(User).where(User.email == "admin@rankforge.com"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("✅ Admin already exists.")
            return

        # Create Admin
        admin_user = User(
            email="admin@rankforge.com",
            password_hash=get_password_hash("admin123"),
            full_name="Sovereign Admin",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        await db.commit()
        print("🚀 Admin Created: admin@rankforge.com / admin123")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_admin())
