import asyncio
from app.db.session import engine
from sqlalchemy import text

async def clean_database():
    print("[SYSTEM] INITIATING SOVEREIGN DATABASE CLEANUP...")
    async with engine.begin() as conn:
        try:
            # 1. DROP Unwanted Tables (Marketplace / Forwarder / Legacy)
            print("[CLEANUP] Dropping legacy/unwanted tables...")
            await conn.execute(text("DROP TABLE IF EXISTS marketplace_submissions CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS marketplace_quotes CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS notification_log CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS shipment_requests CASCADE;"))
            await conn.execute(text("DROP TABLE IF EXISTS forwarders CASCADE;"))
            
            # 2. VERIFY Core Tables Remain
            print("[VERIFICATION] Checking core tables...")
            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [row[0] for row in result.fetchall()]
            
            allowed = ["users", "bookings", "user_activities", "quotes", "alembic_version"]
            
            for t in tables:
                if t in allowed:
                    print(f"✅ KEPT: {t}")
                else:
                    print(f"⚠️ FOUND UNEXPECTED TABLE: {t}")

            print("[SUCCESS] Database Purged of Non-Sovereign Elements.")
        except Exception as e:
            print(f"[ERROR] Cleanup Failed: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(clean_database())
