import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check():
    async with engine.connect() as conn:
        tables = [
            'users', 'forwarders', 'requests', 'quotations', 
            'forwarder_bid_status', 'n8n_events_logs', 
            'n8n_broadcast_logs', 'rejected_attempts', 'n8n_analytics'
        ]
        
        print("\n--- DB SCHEMA VERIFICATION ---\n")
        for table in tables:
            try:
                # Get column info
                result = await conn.execute(text(f"""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = '{table}'
                    ORDER BY ordinal_position
                """))
                columns = result.fetchall()
                if not columns:
                    print(f"❌ Table '{table}' NOT FOUND!")
                    continue
                
                print(f"✅ Table '{table}' exists with {len(columns)} columns:")
                for col in columns:
                    print(f"   - {col[0]} ({col[1]})")
            except Exception as e:
                print(f"❌ Error checking table '{table}': {e}")
        print("\n--- END OF VERIFICATION ---")

if __name__ == "__main__":
    asyncio.run(check())
