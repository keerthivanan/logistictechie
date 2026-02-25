import asyncio
from app.db.session import engine, Base
import app.db.base  # This imports all models into Base

async def init_db():
    print("Initializing Sovereign Database...")
    async with engine.begin() as conn:
        print("Dropping all existing tables to guarantee 1:1 n8n schema sync...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables based on the updated models...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database Successfully Synced with n8n Specifications.")

if __name__ == "__main__":
    asyncio.run(init_db())
