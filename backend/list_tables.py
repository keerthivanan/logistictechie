import asyncio
from app.db.session import engine
from sqlalchemy import text

async def list_tables():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        tables = result.fetchall()
        print("CURRENT TABLES IN DATABASE:")
        for t in tables:
            print(f"- {t[0]}")

if __name__ == "__main__":
    asyncio.run(list_tables())
