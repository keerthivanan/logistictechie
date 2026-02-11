import asyncio
import sys
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def migrate_users():
    print("🔄 STARTING USER TABLE MIGRATION...")
    async with AsyncSessionLocal() as db:
        try:
            # Add missing columns
            print("Adding 'avatar_url'...")
            await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;"))
            
            print("Adding 'preferences'...")
            await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences VARCHAR;"))
            
            print("Adding 'phone_number'...")
            await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR;"))
            
            await db.commit()
            print("✅ Migration Complete: Users table updated.")
            
        except Exception as e:
            print(f"❌ Migration Error: {e}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(migrate_users())
