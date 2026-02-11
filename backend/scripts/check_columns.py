import asyncio
import sys
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def check_columns():
    print("🔍 CHECKING USERS TABLE SCHEMA...")
    async with AsyncSessionLocal() as db:
        try:
            # Query information_schema for columns
            query = text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
            result = await db.execute(query)
            columns = result.fetchall()
            
            print(f"Found {len(columns)} columns:")
            for col in columns:
                print(f" - {col[0]} ({col[1]})")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_columns())
