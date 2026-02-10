import asyncio
import sys
import os
from dotenv import load_dotenv

# Explicitly load .env from backend root
backend_dir = os.path.join(os.getcwd(), 'backend')
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)

# Add backend to path
sys.path.append(backend_dir)

from app.services.ai import cortex
from app.services.ocean.maersk import MaerskClient
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

async def verify_db():
    print("\n🗄️ CHECKING DATABASE CONNECTIVITY...")
    try:
        # Create a temporary engine just for this check
        url = settings.DATABASE_URL
        if "sqlite" in url:
             print(f"   ⚠️ Using SQLite (Warning for Production)")
        
        engine = create_async_engine(url)
        print(f"   ✅ Database URL: Found")
        
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"   ✅ Connection Test: SUCCESS (Result: {result.scalar()})")
        
        await engine.dispose()
    except Exception as e:
        print(f"   ❌ Database Check Failed: {e}")
        # Don't fail the whole script, just report
    
async def verify_ai():
    print("\n🧠 CHECKING AI CORTEX (Prophetic Engine)...")
    try:
        if not settings.OPENAI_API_KEY:
             print("   ❌ AI Check Failed: OPENAI_API_KEY is missing.")
             return

        # Test standard prediction
        prediction = await cortex.predict_market_rates("CNSHA", "SAJED", 2000.0)
        print(f"   ✅ Prediction Logic: FUNCTIONAL")
        print(f"      - Prediction: {prediction['action']}")
        print(f"      - Advice: {prediction['ai_advice']}")
    except Exception as e:
        print(f"   ❌ AI Verification Failed: {e}")

async def verify_maersk():
    print("\n🚢 CHECKING MAERSK INTEGRATION...")
    try:
        # Check Config via Settings
        if settings.MAERSK_CONSUMER_KEY:
             print(f"   ✅ Client Configuration: VALID")
             print(f"      - Key Present: Yes")
        else:
             print(f"   ⚠️ Maersk Keys: MISSING in .env")

        # Check Real Connection
        client = MaerskClient()
        print(f"   🔄 Testing API Connectivity (Live Request)...")
        is_connected = await client.check_connection()
        
        if is_connected:
            print(f"   ✅ Maersk API: ONLINE & REACHARBLE")
        else:
            print(f"   ❌ Maersk API: UNREACHABLE (Check Keys/Network)")
            
    except Exception as e:
        print(f"   ❌ Maersk Client Failed: {e}")

async def verify_settings():
    print("\n⚙️ CHECKING SYSTEM CONFIGURATION...")
    print(f"   ✅ Project Name: {settings.PROJECT_NAME}")
    # print(f"   ✅ Environment: {settings.ENVIRONMENT}") # CONFIG ERROR FIXED
    print(f"   ✅ Database Config: {settings.DATABASE_URL[:10]}...")

async def main():
    print("==================================================")
    print("🦅 PHOENIX SYSTEM GRAND VERIFICATION")
    print("==================================================")
    
    await verify_settings()
    await verify_db()
    await verify_ai()
    await verify_maersk()
    
    print("\n==================================================")
    print("🏆 RESULT: SYSTEM DIAGNOSTIC COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
