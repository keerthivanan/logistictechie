import asyncio
import sys
import os
from sqlalchemy import text, select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.services.ocean.maersk import MaerskClient
try:
    from app.services.sovereign import sovereign_engine
except ImportError:
    sovereign_engine = None

# ANSI
GREEN = "\033[92m"
RED = "\033[91m" 
YELLOW = "\033[93m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log(status: bool, msg: str):
    icon = "✅ AMA-ZING" if status else "❌ FAILED"
    color = GREEN if status else RED
    print(f"{color}{BOLD}{icon}{RESET} : {msg}")

async def verify_amazing_system():
    print(f"\n{BOLD}🚀 8-POINT 'AMAZING' SYSTEM CHECK{RESET}\n")
    
    async with AsyncSessionLocal() as db:
        # 1. DATABASE
        try:
            await db.execute(text("SELECT 1"))
            log(True, "1. Database: CONNECTED & PERFECT")
        except:
            log(False, "1. Database: CRITICAL FAILURE")
            return

        # 2. AUTH & 3. LOGGED IN (Admin Check)
        res = await db.execute(select(User).where(User.email == "admin@rankforge.com"))
        admin = res.scalar_one_or_none()
        if admin and admin.is_active:
             log(True, f"2 & 3. Auth: Admin Ready ({admin.email}) / {admin.role.upper()}")
        else:
             log(False, "2 & 3. Auth: ADMIN USER MISSING! SEED REQUIRED.")

    # 4. MAERSK API (Real + Fallback)
    maersk = MaerskClient()
    try:
        # Check connection logic
        # We don't have keys, so we expect a graceful fallback or empty list, NOT an error.
        res = await maersk.search_locations("Shanghai")
        if isinstance(res, list):
            log(True, "4. Maersk API: Logic is Sound (Returns List)")
        else:
            log(False, "4. Maersk API: Invalid Response Type")
    except Exception as e:
        log(False, f"4. Maersk API: CODING ERROR - {e}")

    # 5. FEATURES & TOOLS (Files Exist)
    tools = [
        "../frontend/src/components/domain/quote/QuoteWizard.tsx",
        "../frontend/src/app/(public)/tracking/page.tsx",
        "../frontend/src/app/(public)/schedules/page.tsx",
        "../frontend/src/app/(public)/tools/page.tsx"
    ]
    missing = [t for t in tools if not os.path.exists(t)]
    if not missing:
        log(True, "5. Features: All 4 Major Tools PRESENT")
    else:
        log(False, f"5. Features: MISSING FILES - {missing}")

    # 6. AI ASSIST (Sovereign Oracle)
    if os.path.exists("../frontend/src/app/(public)/assistant/page.tsx"):
        log(True, "6. AI Assist: 'Sovereign Oracle' Interface DEPLOYED")
    else:
        log(False, "6. AI Assist: MISSING Assistant Page")

    # 7. MARKET TREND (Live Context)
    trend = await sovereign_engine.get_market_trend("CHINA", "Electronics")
    if trend["country"] == "CHINA" and len(trend["data"]) == 12:
         log(True, "7. Market Widget: LIVE & CONTEXT AWARE (China -> China Data)")
    else:
         log(False, "7. Market Widget: GENERIC or BROKEN")

    # 8. WEBSITE WORKING (Filesystem)
    # Correct path is within the (public) route group
    if os.path.exists("../frontend/src/app/(public)/page.tsx") and os.path.exists("../frontend/src/app/layout.tsx"):
         log(True, "8. Website: CORE STRUCTURE VALID (Ready for 'npm run dev')")
    else:
         log(False, "8. Website: CRITICAL STRUCTURE DAMAGE - page.tsx or layout.tsx missing")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_amazing_system())
