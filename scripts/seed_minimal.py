import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

# Hardcoded DB URL from config for direct seed
DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def seed():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Get user
        res = await conn.execute(text("SELECT id FROM users LIMIT 1"))
        user_id = res.scalar()
        
        if not user_id:
            print("No users.")
            return

        print(f"Seeding for {user_id}")
        
        await conn.execute(
            text("INSERT INTO tasks (id, user_id, title, description, task_type, status, priority, created_at, updated_at) VALUES (:id, :user_id, :title, :description, :task_type, :status, :priority, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"),
            [
                {"id": str(uuid.uuid4()), "user_id": user_id, "title": "Approve Sovereign Quote #Q-9921", "description": "High-value container from Shanghai in clearance standby.", "task_type": "APPROVAL", "status": "PENDING", "priority": "CRITICAL"},
                {"id": str(uuid.uuid4()), "user_id": user_id, "title": "Upload Bill of Lading", "description": "Documentation required for Jebel Ali arrival sync.", "task_type": "DOCUMENT", "status": "PENDING", "priority": "HIGH"}
            ]
        )
    print("Done.")

if __name__ == "__main__":
    asyncio.run(seed())
