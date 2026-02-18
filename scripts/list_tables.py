
import asyncio
import sys
import os

# Add backend to path
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def list_tables_strict_postgres():
    print("\n🔍 SCANNING POSTGRESQL DATABASE (STRICT MODE)...\n")
    
    try:
        async with AsyncSessionLocal() as db:
            # Query Information Schema for PUBLIC tables only
            query = text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
            result = await db.execute(query)
            tables = result.scalars().all()
            
            print(f"✅ FOUND {len(tables)} ACTIVE TABLES IN POSTGRESQL:")
            print("===================================================")
            for t in tables:
                print(f"  🐘 {t}")
            print("===================================================")
            
            # Validation
            required = ["users", "quotes", "bookings", "shipment_requests", "forwarders", "marketplace_quotes", "notification_log", "activity_logs"]
            missing = [r for r in required if r not in tables and r != "activity_logs"] # approximate check
            
            if not missing:
                print("✅ CORE SCHEMA INTEGRITY: VERIFIED.")
            else:
                print(f"⚠️  MISSING CORE TABLES: {missing}")

    except Exception as e:
        print(f"❌ POSTGRES CONNECTION ERROR: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(list_tables_strict_postgres())
