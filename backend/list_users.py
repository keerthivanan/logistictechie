import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.user import User

DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def list_all_users():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"[{u.email}] -> Name: {u.full_name} | Avatar: {u.avatar_url}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_all_users())
