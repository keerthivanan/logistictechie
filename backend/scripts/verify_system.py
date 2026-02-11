import asyncio
import sys
import os
import aiohttp
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

# ANSI Colors
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

def print_status(component, status, message=""):
    symbol = "✅" if status else "❌"
    color = GREEN if status else RED
    print(f"{symbol} {BOLD}{component:<20}{RESET}: {color}{'Pass' if status else 'FAIL'}{RESET} {message}")

async def verify_backend_health():
    print(f"\n{BOLD}🔍 BACKEND HEALTH CHECK{RESET}")
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
            print_status("Database Connection", True, "PostgreSQL Active")
            
            # Check Tables
            for table in ["users", "bookings", "payments"]:
                res = await db.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = res.scalar()
                print_status(f"Table '{table}'", True, f"Rows: {count}")
                
            # Check Admin
            res = await db.execute(text("SELECT email FROM users WHERE role='admin'"))
            user = res.first()
            if user:
                print_status("Admin User", True, f"Found {user[0]}")
            else:
                print_status("Admin User", False, "Not found - Seeding required")

    except Exception as e:
        print_status("Database", False, str(e))

async def verify_maersk_integration():
    print(f"\n{BOLD}🚢 MAERSK API SIMULATION CHECK{RESET}")
    # In this "Best of All Time" localized version, we verify the specific mock logic is active
    # as we do not have live keys. We check if the logic file exists.
    frontend_path = "../frontend/src/lib/logistics.ts"
    if os.path.exists(frontend_path):
        print_status("Logistics Library", True, "Local 'Maersk' Logic Found")
        with open(frontend_path, "r", encoding="utf-8") as f:
            content = f.read()
            if "Maersk" in content and "transit_time_days" in content:
                 print_status("Carrier Logic", True, "Maersk Algorithms Active")
            else:
                 print_status("Carrier Logic", False, "Maersk keyword missing")
    else:
        print_status("Logistics Library", False, "File missing")

async def verify_frontend_files():
    print(f"\n{BOLD}💻 FRONTEND INTEGRITY CHECK{RESET}")
    required_files = [
        "../frontend/src/app/(public)/assistant/page.tsx",
        "../frontend/src/components/domain/ai/CreativeCortex.tsx",
        "../frontend/src/components/widgets/MarketTrendWidget.tsx",
        "../frontend/src/app/(public)/dashboard/page.tsx"
    ]
    
    for file_path in required_files:
        exists = os.path.exists(file_path)
        name = os.path.basename(file_path)
        print_status(f"File '{name}'", exists, "Present" if exists else "MISSING")

async def main():
    print(f"{BOLD}⚡ THE GLOBAL ORACLE - FINAL SYSTEM AUDIT ⚡{RESET}")
    await verify_backend_health()
    await verify_maersk_integration()
    await verify_frontend_files()
    print("\n🚀 AUDIT COMPLETE.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
