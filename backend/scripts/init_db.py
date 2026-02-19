import asyncio
from app.db.session import engine
from app.db.base import Base

async def init_db():
    print(f"[DATABASE] Initializing Sovereign Tables...")
    try:
        async with engine.begin() as conn:
            # This will create all tables defined in Base.metadata
            # including the newly added Marketplace and Forwarder models
            await conn.run_sync(Base.metadata.create_all)
        print("[DATABASE] Handshake Successful. Tables Synchronized.")
    except Exception as e:
        print(f"[DATABASE] Error during initialization: {e}")

if __name__ == "__main__":
    asyncio.run(init_db())
