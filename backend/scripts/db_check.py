
import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def check_db():
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(text("SELECT 1"))
            print(f"[DB_STATUS] Connection focus: STABLE (Result: {result.scalar()})")
    except Exception as e:
        print(f"[DB_STATUS] Connection focus: BLURRED (Error: {e})")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(check_db())
