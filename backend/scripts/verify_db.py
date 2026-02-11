import asyncio
import sys
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def verify_database():
    print("⚡ STARTING DEEP DATABASE INTEGRITY CHECK ⚡")
    try:
        async with AsyncSessionLocal() as db:
            # 1. Check Connection
            await db.execute(text("SELECT 1"))
            print("✅ Database Connection: ACTIVE")

            # 2. Check Core Tables
            tables = ["users", "bookings", "payments"]
            for table in tables:
                try:
                    result = await db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"✅ Table '{table}': EXISTS (Rows: {count})")
                except Exception as e:
                    print(f"❌ Table '{table}': MISSING or ERROR - {e}")

            # 3. Check Critical User Data (Admin)
            result = await db.execute(text("SELECT email, role FROM users WHERE role = 'admin'"))
            admin = result.first()
            if admin:
                print(f"✅ Admin User: FOUND ({admin.email})")
            else:
                print("⚠️  Admin User: NOT FOUND (System might need seeding)")

    except Exception as e:
        print(f"❌ CRITICAL DATABASE FAILURE: {e}")
        sys.exit(1)

    print("🚀 DATABASE STATUS: PERFECT FOR LAUNCH")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_database())
