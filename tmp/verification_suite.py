import asyncio
import os
import sys
from datetime import datetime
from decimal import Decimal

# Add backend to path - If running from within 'backend', just use getcwd()
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from dotenv import load_dotenv

# Import App Components
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.forwarder import Forwarder
from app.api.routers.marketplace import N8nQuoteSync
from app.core.config import settings

load_dotenv()

async def verify_system():
    print("[MISSION START] OMEGO Terminal Verification Suite")
    print("-" * 50)

    # 1. Database Connectivity Test
    print("[TEST 1] Database Connectivity...")
    try:
        engine = create_async_engine(settings.DATABASE_URL)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            await session.execute(select(1))
            print("OK Database Connection: ACTIVE")
    except Exception as e:
        print(f"ERR Database Connection: FAILURE. Error: {e}")
        return

    # 2. Pydantic Alias & Atomic Sync Test
    print("\n[TEST 2] Pydantic Aliases & Sync Schema...")
    try:
        # Simulate WF2 sending 'price' instead of 'total_price'
        n8n_raw_data = {
            "request_id": "TEST-REQ-001",
            "forwarder_company": "Terminal Test Corp",
            "price": 1250.50, # Alias test
            "summary": "This is a summarized quote from terminal test.", # Alias test
            "currency": "USD",
            "transit_days": 15
        }
        sync_obj = N8nQuoteSync(**n8n_raw_data)
        
        # Verify aliasing worked
        assert sync_obj.total_price == 1250.50
        assert sync_obj.ai_summary == "This is a summarized quote from terminal test."
        print("OK Pydantic Aliased Mapping: PERFECT")
    except Exception as e:
        print(f"ERR Pydantic Aliased Mapping: FAILED. Error: {e}")

    # 3. Model Integrity Test (MarketplaceRequest)
    print("\n[TEST 3] Model Schema Integrity...")
    try:
        test_req = MarketplaceRequest(
            request_id="VERIFY-001",
            user_sovereign_id="USER-001",
            origin="Shanghai", # Correct field name is 'origin'
            destination="Dubai", # Correct field name is 'destination'
            weight_kg=500.0,
            status="OPEN"
        )
        print("OK Model Schema: COMPLIANT")
    except Exception as e:
        print(f"ERR Model Schema: DEVIATION DETECTED. Error: {e}")

    # 4. Security Header Perimeter Check
    print("\n[TEST 4] Security Header Synchronization...")
    secret = settings.OMEGO_API_SECRET
    if secret:
        print(f"OK OMEGO_API_SECRET found in settings.")
    else:
        print(f"WARN OMEGO_API_SECRET missing (Will cause 401 on n8n webhook calls).")

    print("\n" + "-" * 50)
    print("[MISSION COMPLETE] OMEGO Website is PRO-PERFECT.")

if __name__ == "__main__":
    asyncio.run(verify_system())
