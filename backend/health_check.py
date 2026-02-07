import asyncio
import sys
import os

# Ensure backend is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.session import engine
from sqlalchemy import text

# 🏥 RUNTIME HEALTH CHECK
# Imports the actual app config and tries a connection.

async def health_check():
    print("🏥 Starting System Health Check...")
    
    # 1. Verify Config Load
    print(f"   - Config Loaded: OK (Env: {settings.Config.env_file})")
    print(f"   - DB URL: {settings.DATABASE_URL.split('@')[-1]}") # Hide password
    
    # 2. Verify Database Connection via Engine
    print("   - Testing DB Connectivity...", end="")
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print(" ✅ CONNECTED")
            
        print("\n🚀 SYSTEM IS HEALTHY. READY TO SERVE.")
        
    except Exception as e:
        print(f"\n❌ HEALTH CHECK FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    try:
        asyncio.run(health_check())
    except ImportError as e:
        print(f"\n❌ IMPORT ERROR: {e}")
        print("   The code has a syntax or import error.")
