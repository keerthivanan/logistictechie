import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def inspect_tasks():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks'"))
        cols = res.fetchall()
        print("\n[SCHEMA AUDIT] 'tasks' table:")
        for c in cols:
            print(f" - {c[0]}: {c[1]}")

if __name__ == "__main__":
    asyncio.run(inspect_tasks())
