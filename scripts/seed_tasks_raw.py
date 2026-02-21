import asyncio
import os
import sys
import uuid
from datetime import datetime

# Ensure backend root is in path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def seed_raw():
    async with AsyncSessionLocal() as db:
        # Get a user
        result = await db.execute(text("SELECT id FROM users LIMIT 1"))
        user_id = result.scalar()
        
        if not user_id:
            print("No users found.")
            return

        print(f"Seeding tasks for user: {user_id}")
        
        tasks = [
            (str(uuid.uuid4()), user_id, "Approve Sovereign Quote #Q-9921", "High-value container from Shanghai in clearance standby.", "APPROVAL", "PENDING", "CRITICAL"),
            (str(uuid.uuid4()), user_id, "Upload Bill of Lading", "Documentation required for Jebel Ali arrival sync.", "DOCUMENT", "PENDING", "HIGH")
        ]

        for t_data in tasks:
            await db.execute(
                text("INSERT INTO tasks (id, user_id, title, description, task_type, status, priority, created_at, updated_at) VALUES (:id, :user_id, :title, :description, :task_type, :status, :priority, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"),
                {"id": t_data[0], "user_id": t_data[1], "title": t_data[2], "description": t_data[3], "task_type": t_data[4], "status": t_data[5], "priority": t_data[6]}
            )
        
        await db.commit()
        print("Successfully seeded tasks via Raw SQL.")

if __name__ == "__main__":
    asyncio.run(seed_raw())
