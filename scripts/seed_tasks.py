import asyncio
import os
import sys

# Ensure backend root is in path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import AsyncSessionLocal
from app.crud.task import task as task_crud
from app.crud.user import user as user_crud

async def init_tasks():
    # Use the first user found for the demo
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        from app.models.user import User
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        if not users:
            print("No users found to assign tasks to.")
            return

        user = users[0]
        print(f"Assigning tasks to {user.email} ({user.id})")

        sample_tasks = [
            {
                "title": "Approve Sovereign Quote #Q-9921",
                "description": "High-value container from Shanghai in clearance standby.",
                "priority": "CRITICAL",
                "task_type": "APPROVAL"
            },
            {
                "title": "Upload Bill of Lading",
                "description": "Documentation required for Jebel Ali arrival sync.",
                "priority": "HIGH",
                "task_type": "DOCUMENT"
            }
        ]

        for s_task in sample_tasks:
            # Check if exists
            result = await db.execute(select(User).filter(User.id == user.id)) # dummy check
            await task_crud.create(db, obj_in=s_task, user_id=str(user.id))
        
        print("Successfully seeded operational tasks.")

if __name__ == "__main__":
    asyncio.run(init_tasks())
