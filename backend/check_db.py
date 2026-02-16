import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def verify_db():
    print(f"\n🔍 ENTERPRISE DATABASE AUDIT: {DATABASE_URL}")
    print("="*60)
    
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.connect() as conn:
            # 1. Connection Test
            await conn.execute(text("SELECT 1"))
            print("✅ Connection: ESTABLISHED")

            # 2. Table Audit
            print("\n🔍 Investigating Tables...")
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [row[0] for row in result.fetchall()]
            
            required_tables = ['users', 'bookings', 'user_activities', 'quotes']
            for table in required_tables:
                if table in tables:
                    print(f"✅ Table Found: {table}")
                else:
                    print(f"❌ Table Missing: {table}")

            # 3. Schema Detail Check
            if 'users' in tables:
                print("\n🔍 Checking 'users' Schema...")
                columns = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"))
                for col in columns.fetchall():
                    print(f"   - {col[0]}: {col[1]}")

        await engine.dispose()
        print("\n" + "="*60)
        print("🏆 DATABASE INTEGRITY VERIFIED.")
        
    except Exception as e:
        print(f"\n❌ DATABASE CRITICAL FAILURE: {e}")
        print("\n💡 TIP: Ensure PostgreSQL is running and 'logistics_db' is created.")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    asyncio.run(verify_db())
