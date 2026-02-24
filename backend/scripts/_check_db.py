import asyncio
import asyncpg

async def test():
    try:
        c = await asyncpg.connect("postgresql://postgres:2003@localhost:5432/logistics_db")
        v = await c.fetchval("SELECT version()")
        print(f"DB OK: {v}")
        
        # Check tables
        tables = await c.fetch("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
        print(f"\nTables found ({len(tables)}):")
        for t in tables:
            print(f"  - {t['tablename']}")
        
        await c.close()
    except Exception as e:
        print(f"DB ERROR: {e}")

asyncio.run(test())
