
import asyncio
import sys
import os

# Add backend to path
backend_path = os.path.join(os.getcwd(), 'backend')
sys.path.append(backend_path)

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def upgrade_schema():
    print("\n🛠️  STARTING SCHEMA UPGRADE: QUOTE USER LINKAGE\n")
    
    try:
        async with AsyncSessionLocal() as db:
            # Check if column exists
            print("🔍 Checking if 'user_id' exists in 'quotes'...")
            check_query = text("SELECT column_name FROM information_schema.columns WHERE table_name='quotes' AND column_name='user_id';")
            result = await db.execute(check_query)
            exists = result.scalar()
            
            if exists:
                print("✅ Column 'user_id' ALREADY EXISTS. detailed audit skipped.")
            else:
                print("⚠️  Column MISSING. Upgrading Schema...")
                
                # Add Column
                await db.execute(text("ALTER TABLE quotes ADD COLUMN user_id VARCHAR;"))
                print("✅ Added 'user_id' column.")
                
                # Add Index
                await db.execute(text("CREATE INDEX ix_quotes_user_id ON quotes (user_id);"))
                print("✅ Created Index 'ix_quotes_user_id'.")
                
                await db.commit()
                print("🎉 UPGRADE COMPLETE. Schema is now RELATIONAL.")

    except Exception as e:
        print(f"❌ UPGRADE FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(upgrade_schema())
