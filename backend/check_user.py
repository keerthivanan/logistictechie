import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
import sys
import os

# Adjust path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.user import User

DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def check_user_avatar():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(User).filter(User.email == "keerthivanan.ds.ai@gmail.com"))
        user = result.scalars().first()
        if user:
            print(f"USER: {user.full_name}")
            print(f"AVATAR_URL: {user.avatar_url}")
            print(f"ID: {user.id}")
        else:
            print("User not found.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_user_avatar())
