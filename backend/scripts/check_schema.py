import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def check_schema():
    async with AsyncSessionLocal() as session:
        print("🔍 OMEGO DATABASE DIAGNOSTICS")
        
        # Check tables
        tables_res = await session.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"))
        tables = [r[0] for r in tables_res.all()]
        print(f"Tables found: {tables}")
        
        # BRUTE FORCE HARDENING: Alter all character varying to TEXT
        tables = ["requests", "quotations", "forwarder_bid_status", "users"]
        for table in tables:
            print(f"🛡️ HARDENING TABLE: {table}")
            # Get all varchar columns
            res = await session.execute(text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '{table}' AND data_type = 'character varying' AND table_schema = 'public';
            """))
            cols = [r[0] for r in res.all()]
            for col in cols:
                print(f"  -> Altering {col} to TEXT...")
                await session.execute(text(f"ALTER TABLE {table} ALTER COLUMN {col} TYPE TEXT"))
        
        await session.commit()
        print("✅ SOVEREIGN HARDENING COMPLETE: Truncation Ghost Eliminated.")
        
        # Check Final State
        if "users" in tables:
            user_count = await session.execute(text("SELECT count(*) FROM users"))
            print(f"\nUser count: {user_count.scalar()}")

if __name__ == "__main__":
    asyncio.run(check_schema())
