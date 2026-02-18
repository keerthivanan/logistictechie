import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from sqlalchemy import delete
import sys
import os

# Adjust path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.models.user import User
from app.models.booking import Booking
from app.models.activity import UserActivity

DATABASE_URL = "postgresql+asyncpg://postgres:2003@localhost:5432/logistics_db"

async def cleanup_user():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    email = "keerthivanan.ds.ai@gmail.com"
    
    async with async_session() as session:
        result = await session.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        if user:
            print(f"Cleaning up user: {user.full_name} ({user.id})")
            
            # Delete Bookings
            await session.execute(delete(Booking).where(Booking.user_id == user.id))
            print("Deleted all bookings.")
            
            # Delete Activities except SOCIAL LINK (Keep some real history)
            # Actually, let's just keep everything real.
            print("Activities preserved (unless you want them gone too).")
            
            await session.commit()
        else:
            print("User not found.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(cleanup_user())
