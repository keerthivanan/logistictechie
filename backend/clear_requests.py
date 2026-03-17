
import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def clear_requests():
    async with AsyncSessionLocal() as session:
        try:
            # First, check how many we are deleting
            result = await session.execute(text("SELECT count(*) FROM requests"))
            count = result.scalar()
            
            # Perform deletion (quotations should cascade delete based on model definition)
            await session.execute(text("DELETE FROM requests"))
            await session.commit()
            
            print(f"SUCCESS: Removed {count} requests and associated data.")
        except Exception as e:
            await session.rollback()
            print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(clear_requests())
