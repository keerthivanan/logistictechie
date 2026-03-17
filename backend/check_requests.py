
import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def check():
    async with AsyncSessionLocal() as session:
        try:
            # Check all statuses
            result = await session.execute(text("SELECT status, count(*) FROM requests GROUP BY status"))
            counts = result.all()
            print("--- Request Status Breakdown ---")
            for status, count in counts:
                print(f"{status}: {count}")
            
            # Specifically check OPEN
            result = await session.execute(text("SELECT count(*) FROM requests WHERE status = 'OPEN'"))
            open_count = result.scalar()
            print(f"\nFINAL_OPEN_COUNT={open_count}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(check())
