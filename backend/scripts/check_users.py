import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import select
from app.models.user import User

async def main():
    try:
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(User))
            users = res.scalars().all()
            print(f'Users in DB: {[u.email for u in users]}')
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    if hasattr(asyncio, 'WindowsSelectorEventLoopPolicy'):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
