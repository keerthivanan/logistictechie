import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def verify_db():
    print("STARTING DB INTEGRITY CHECK...")
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            val = result.scalar()
            print(f"✅ DB CONNECTIVITY: SUCCESS (Result: {val})")
            
            # Check for bookings table
            result = await session.execute(text("SELECT count(*) FROM bookings"))
            count = result.scalar()
            print(f"✅ DB SCHEMA: Bookings table found. Count: {count}")
    except Exception as e:
        print(f"❌ DB INTEGRITY FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(verify_db())
