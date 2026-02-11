import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from sqlalchemy import select

async def run():
    async with SessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print("Users in DB:")
        for u in users:
            print(f"- {u.email} (Role: {u.role})")

if __name__ == "__main__":
    asyncio.run(run())
