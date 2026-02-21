import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import AsyncSessionLocal
from sqlalchemy import select, func
from app.models.task import Task

async def verify():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(func.count(Task.id)).filter(Task.status == 'PENDING'))
        count = res.scalar()
        print(f"\n[VERIFICATION] PENDING TASKS IN DB: {count}")
        if count >= 2:
            print("✅ SYSTEM SYNCHRONIZED.")
        else:
            print("❌ DATA MISMATCH.")

if __name__ == "__main__":
    asyncio.run(verify())
