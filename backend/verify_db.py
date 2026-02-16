import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def check_db():
    print("🔍 AUDITING DATABASE INTEGRITY...")
    engine = create_async_engine(DATABASE_URL)
    try:
        async with engine.connect() as conn:
            # Check Tables
            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [row[0] for row in result]
            print(f"✅ TABLES FOUND: {', '.join(tables)}")
            
            # Check User Count
            res_user = await conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = res_user.scalar()
            print(f"✅ USER COUNT: {user_count}")
            
            # Check Booking Count
            res_book = await conn.execute(text("SELECT COUNT(*) FROM bookings"))
            book_count = res_book.scalar()
            print(f"✅ BOOKING COUNT: {book_count}")
            
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
