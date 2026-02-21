import asyncio
import uuid
import sqlalchemy
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Pure isolated seed logic
DB_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def seed():
    engine = create_async_engine(DB_URL)
    async with engine.connect() as conn:
        # 1. Get User
        res = await conn.execute(text("SELECT id FROM users LIMIT 1"))
        user_id = res.scalar()
        if not user_id: return
        
        # 2. Hard Seeding
        task1_id = str(uuid.uuid4())
        await conn.execute(text(f"INSERT INTO tasks (id, user_id, title, description, task_type, status, priority, created_at, updated_at) VALUES ('{task1_id}', '{user_id}', 'Approve Sovereign Quote #Q-9921', 'High-value container from Shanghai in clearance standby.', 'APPROVAL', 'PENDING', 'CRITICAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"))
        
        task2_id = str(uuid.uuid4())
        await conn.execute(text(f"INSERT INTO tasks (id, user_id, title, description, task_type, status, priority, created_at, updated_at) VALUES ('{task2_id}', '{user_id}', 'Upload Bill of Lading', 'Documentation required for Jebel Ali arrival sync.', 'DOCUMENT', 'PENDING', 'HIGH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"))
        
        await conn.commit()
    print("Dashboard seeded.")

if __name__ == "__main__":
    asyncio.run(seed())
