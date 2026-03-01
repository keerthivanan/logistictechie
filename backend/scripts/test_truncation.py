import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def test_truncation():
    async with AsyncSessionLocal() as session:
        print("[*] BRUTE FORCE TRUNCATION TEST")
        long_val = "X" * 100
        
        tables = ["requests", "quotations", "forwarder_bid_status", "users", "n8n_events_logs", "n8n_broadcast_logs", "rejected_attempts"]
        
        for table in tables:
            print(f"\nTesting Table: {table}")
            # Get columns
            res = await session.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}' AND data_type = 'character varying'"))
            cols = [r[0] for r in res.all()]
            
            for col in cols:
                print(f"  -> Testing {col}...")
                try:
                    await session.execute(text(f"INSERT INTO {table} ({col}) VALUES ('{long_val}')"))
                    await session.rollback()
                except Exception as e:
                    if "value too long" in str(e):
                        print(f"  !!! CULPRIT FOUND: {table}.{col} is limited! !!!")
                        print(f"  Error: {e}")
                    await session.rollback()

if __name__ == "__main__":
    asyncio.run(test_truncation())
