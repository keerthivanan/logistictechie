import asyncio
import asyncpg
from app.core.config import settings

# 🛡️ FINAL VERIFICATION TOOL
# Checks if the tables actually exist in the DB.

async def verify_tables():
    print("Inspecting Database Structure...")
    url = settings.DATABASE_URL
    print(f"Connecting to: {url}")
    # Fix for raw asyncpg usage
    url = url.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(url)
        
        # Query for table names in public schema
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
        
        rows = await conn.fetch(query)
        tables = [row['table_name'] for row in rows if row['table_name'] != 'alembic_version']
        
        print(f"\nFOUND {len(tables)} CORE TABLES:")
        for t in tables:
            print(f"   - {t}")
            
        required = {'users', 'quotes', 'bookings'}
        if required.issubset(set(tables)):
            print("\nSYSTEM STATUS: 100% READY [BEST OF ALL TIME]")
        else:
            print(f"\nWARNING: Missing tables. Expected {required}")
            
        await conn.close()
        
    except Exception as e:
        print(f"\nVERIFICATION FAILED: {e}")

if __name__ == "__main__":
    import os
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_tables())
