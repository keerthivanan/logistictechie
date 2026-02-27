import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Checking for company_email column in users table...")
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN company_email VARCHAR;"))
            print("Successfully added company_email column to users table.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column company_email already exists in users table.")
            else:
                print(f"Error adding column: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
