
import asyncio
import os
import sys

# Setup paths
sys.path.append(os.getcwd())

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.activity import UserActivity
from sqlalchemy import select, func

async def get_user_stats():
    target_email = "keerthivanan.ds.ai@gmail.com"
    async with AsyncSessionLocal() as db:
        # 1. Total Enrolled Citizens (Users)
        user_count_res = await db.execute(select(func.count(User.id)))
        total_users = user_count_res.scalar() or 0

        # 2. Get target user details
        user_res = await db.execute(select(User).filter(User.email == target_email))
        target_user = user_res.scalars().first()

        print("-" * 50)
        print("SOVEREIGN INTELLIGENCE - TARGET AUDIT REPORT")
        print("-" * 50)
        
        if target_user:
            print(f"USER: {target_user.full_name or 'N/A'}")
            print(f"EMAIL: {target_user.email}")
            print(f"ID: {target_user.id}")
            print(f"SOVEREIGN ID: {target_user.sovereign_id}")
            print(f"CREATED: {target_user.created_at.strftime('%Y-%m-%d %H:%M')}")
            
            # 3. Get user activity stats
            activity_count_res = await db.execute(
                select(func.count(UserActivity.id)).filter(UserActivity.user_id == target_user.id)
            )
            print(f"TOTAL ACTIONS LOGGED: {activity_count_res.scalar() or 0}")

            # 4. Get recent specific actions
            recent_actions_res = await db.execute(
                select(UserActivity.action, UserActivity.created_at)
                .filter(UserActivity.user_id == target_user.id)
                .order_by(UserActivity.created_at.desc())
                .limit(10)
            )
            recent_actions = recent_actions_res.all()
            
            print("-" * 50)
            print("RECENT ACTIVITY (TOP 10):")
            for action, date in recent_actions:
                print(f"[{date.strftime('%H:%M:%S')}] {action}")
        else:
            print(f"ERROR: User '{target_email}' not found in the Ledger.")
        
        print("-" * 50)
        print(f"GLOBAL NETWORK POPULATION: {total_users}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(get_user_stats())
