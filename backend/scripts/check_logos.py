import asyncio
from sqlalchemy import select
from app.models.forwarder import Forwarder
from app.db.session import DATABASE_URL
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def check_logos():
    async with AsyncSessionLocal() as session:
        stmt = select(Forwarder)
        result = await session.execute(stmt)
        forwarders = result.scalars().all()
        
        print(f"Found {len(forwarders)} forwarders:")
        for f in forwarders:
            print(f"ID: {f.forwarder_id} | Name: {f.company_name} | Logo: {f.logo_url}")

if __name__ == "__main__":
    asyncio.run(check_logos())
