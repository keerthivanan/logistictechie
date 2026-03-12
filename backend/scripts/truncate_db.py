import asyncio
import asyncpg
import os

async def wipe_db():
    print("[SYSTEM] Connecting to Sovereign Database...")
    try:
        conn = await asyncpg.connect("postgresql://postgres:2003@localhost:5432/logistics_db")
        
        tables = [
            "user_activities",
            "tasks",
            "quotes",
            "marketplace_bids",
            "marketplace_requests",
            "forwarders",
            "bookings",
            "users"
        ]
        
        print(f"[SYSTEM] Truncating {len(tables)} tables (CASCADE)...")
        # CASCADE ensures we don't hit foreign key constraint violations
        await conn.execute(f"TRUNCATE TABLE {', '.join(tables)} CASCADE;")
        
        print("[SYSTEM] Database wiped successfully. Clean slate achieved.")
        await conn.close()
    except Exception as e:
        print(f"[ERROR] Failed to wipe database: {e}")

if __name__ == "__main__":
    asyncio.run(wipe_db())
