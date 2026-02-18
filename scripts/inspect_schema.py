
import asyncio
import sys
import os

# Add backend to path
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def inspect_quotes_columns():
    print("\n🔍 INSPECTING 'quotes' TABLE COLUMNS...\n")
    
    try:
        async with AsyncSessionLocal() as db:
            # Postgres query for columns
            query = text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'quotes';")
            result = await db.execute(query)
            columns = result.fetchall()
            
            print(f"✅ FOUND {len(columns)} COLUMNS:")
            print("--------------------------------")
            found_cols = []
            for col in columns:
                print(f"  📝 {col[0]} ({col[1]})")
                found_cols.append(col[0])
            print("--------------------------------")
            
            # Check for new fields
            new_fields = ["is_real", "source_endpoint", "request_data", "risk_score", "carbon_emissions"]
            missing = [f for f in new_fields if f not in found_cols]
            
            if missing:
                print(f"❌ MISSING COLUMNS: {missing}")
                print("⚠️  MIGRATION REQUIRED.")
                sys.exit(1)
            else:
                print("✅ SCHEMA MATCHES MODEL.")
                sys.exit(0)

    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(inspect_quotes_columns())
