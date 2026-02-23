import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def purge_mock_data():
    async with AsyncSessionLocal() as db:
        print("\n[STABILIZATION] Purging legacy mock activities...")
        
        # We delete activities that don't match our new real action types or are clearly from seeders
        # For a "Best of All Time" reset, we purge all existing activities to start fresh with real telemetry
        await db.execute(text("DELETE FROM user_activities"))
        await db.commit()
        print("✅ Ledger purged. Ready for authentic telemetry.")

if __name__ == "__main__":
    asyncio.run(purge_mock_data())
