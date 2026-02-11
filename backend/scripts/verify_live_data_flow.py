import asyncio
import sys
import json
from datetime import datetime

# Hack to import app modules locally
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import AsyncSessionLocal
from app.core import security
from app.crud.user import user as user_crud
from app.schemas import RateRequest, OceanQuote
from app.api.routers.quotes import get_real_ocean_quotes
from app.services.ai import cortex
from app.services.sovereign import sovereign_engine

# ANSI Colors
GREEN = "\033[92m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

async def test_live_data_flow():
    print(f"\n{BOLD}⚡ THE GLOBAL ORACLE - LIVE DATA FLOW SIMULATION ⚡{RESET}\n")
    
    # 1. AUTHENTICATION & LOGIN
    print(f"{BOLD}[1] TESTING ADMIN LOGIN FLOW...{RESET}")
    async with AsyncSessionLocal() as db:
        user = await user_crud.get_by_email(db, email="admin@rankforge.com")
        if user and user.email == "admin@rankforge.com":
            # Simulate password check
            is_valid = security.verify_password("admin123", user.password_hash)
            if is_valid:
                print(f"{GREEN}✅ LOGIN SUCCESS: Authenticated 'admin@rankforge.com' (ID: {user.id}){RESET}")
                token = security.create_access_token(data={"sub": user.email})
                print(f"   🎟️  JWT Token Generated: {token[:20]}...")
            else:
                 print(f"{RED}❌ LOGIN FAILED: Password Mismatch{RESET}")
        else:
             print(f"{RED}❌ LOGIN FAILED: User Not Found{RESET}")

    # 2. LOGISTICS QUOTE ENGINE
    print(f"\n{BOLD}[2] TESTING QUOTE GENERATION (Shanghai -> Rotterdam)...{RESET}")
    req = RateRequest(
        origin="CNSHA", 
        destination="NLRTM", 
        container="40HC", 
        goods_value=50000, 
        weight_kg=12000
    )
    
    try:
        # Direct call to the router logic (bypassing HTTP layer for speed)
        result = await get_real_ocean_quotes(req)
        quotes = result.get("quotes", [])
        
        if len(quotes) > 0:
            print(f"{GREEN}✅ QUOTE ENGINE ACTIVE: Generated {len(quotes)} Options{RESET}")
            for q in quotes:
                is_real = "REAL API" if q.get("is_real_api_rate") else "SOVEREIGN ESTIMATE"
                print(f"   🚢 {q['carrier_name']} | ${q['price']} | {q['transit_time_days']} Days | ({is_real})")
        else:
             print(f"{RED}❌ QUOTE ENGINE FAILED: No Quotes Returned{RESET}")
    except Exception as e:
        print(f"{RED}❌ QUOTE ERROR: {e}{RESET}")

    # 3. ARTIFICIAL INTELLIGENCE (Creative Cortex)
    print(f"\n{BOLD}[3] TESTING AI STREAMING (Question: 'What are the rates to Rotterdam?')...{RESET}")
    response_buffer = ""
    try:
        # Simulate streaming consumption
        async for token in cortex.stream_chat("What are the rates to Rotterdam?"):
             response_buffer += token
             
        if len(response_buffer) > 10:
            print(f"{GREEN}✅ AI ONLINE: Response Generated ({len(response_buffer)} chars){RESET}")
            print(f"   🤖 Cortex Says: \"{response_buffer[:100]}...\"")
        else:
            print(f"{RED}❌ AI FAILED: Empty Response{RESET}")
    except Exception as e:
         print(f"{RED}❌ AI ERROR: {e}{RESET}")

    # 4. MARKET INTELLIGENCE
    print(f"\n{BOLD}[4] TESTING MARKET TRENDS (Region: CHINA)...{RESET}")
    try:
        trend = await sovereign_engine.get_market_trend(country="CHINA", commodity="Electronics")
        if trend["country"] == "CHINA" and len(trend["data"]) == 12:
             print(f"{GREEN}✅ MARKET INTEL: trend data calibrated for CHINA.{RESET}")
             latest = trend["data"][-1]
             print(f"   📈 Forecast: {latest['date']} @ ${latest['price']} ({trend['trend_direction']})")
        else:
             print(f"{RED}❌ MARKET INTEL FAILED: Invalid Data Structure{RESET}")
    except Exception as e:
        print(f"{RED}❌ TREND ERROR: {e}{RESET}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_live_data_flow())
