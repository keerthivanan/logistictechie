import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def stabilize_tasks():
    async with AsyncSessionLocal() as db:
        print("\n[STABILIZATION] Resetting 'tasks' table for primitive string compatibility...")
        
        # 1. Drop old table
        await db.execute(text("DROP TABLE IF EXISTS tasks CASCADE"))
        
        # 2. Create new table with primitive strings
        await db.execute(text("""
            CREATE TABLE tasks (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR REFERENCES users(id),
                title VARCHAR NOT NULL,
                description TEXT,
                task_type VARCHAR,
                status VARCHAR DEFAULT 'PENDING',
                priority VARCHAR DEFAULT 'MEDIUM',
                due_date TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        await db.commit()
        print("✅ 'tasks' table stabilized.")

if __name__ == "__main__":
    asyncio.run(stabilize_tasks())
