import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def wipe_all_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("[SYSTEM] INITIATING TOTAL DATA PURGE...")
        
        # List of tables to attempt clearing (Sovereign Core)
        tables = [
            "quotes", "bookings", "user_activities", "users"
        ]
        
        for table in tables:
            try:
                await session.execute(text(f"TRUNCATE {table} CASCADE;"))
                print(f"[CLEANUP] Table '{table}' cleared.")
            except Exception as e:
                print(f"[CLEANUP] Skipping '{table}' (Table might not exist yet).")
                await session.rollback() # Rollback failed statement to continue
        
        await session.commit()
        print("[SYSTEM] ALL AVAILABLE TABLES CLEARED. OMEGO OS IS CLEAN.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(wipe_all_data())
