
import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def count():
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(text("SELECT count(*) FROM forwarders"))
            total = result.scalar()
            
            result = await session.execute(text("SELECT count(*) FROM forwarders WHERE status = 'ACTIVE'"))
            active = result.scalar()
            
            print(f"TOTAL_FORWARDERS={total}")
            print(f"ACTIVE_FORWARDERS={active}")
            
            # Print names for verification
            result = await session.execute(text("SELECT company_name FROM forwarders WHERE status = 'ACTIVE'"))
            names = [row[0] for row in result.all()]
            print(f"NAMES={', '.join(names)}")
        except Exception as e:
            print(f"ERROR={e}")

if __name__ == "__main__":
    asyncio.run(count())
