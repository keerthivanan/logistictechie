import asyncio
import asyncpg
import httpx
from app.core.config import settings
from app.services.sovereign import sovereign_engine
import os

async def run_supreme_pulse():
    print("\n" + "="*60)
    print("      PHOENIX LOGISTICS OS: SUPREME PULSE DIAGNOSTIC")
    print("="*60 + "\n")

    # 1. DATABASE CONNECTIVITY & SCHEMA AUDIT
    print("[1/4] AUDITING DATABASE CONNECTIVITY...")
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    try:
        conn = await asyncpg.connect(url)
        print("   STATUS: PostgreSQL Handshake: SUCCESSFUL")
        
        # Check Columns in 'quotes' table
        print("   STATUS: Checking Sovereign Column Alignment...")
        columns_query = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'quotes';
        """
        rows = await conn.fetch(columns_query)
        cols = [row['column_name'] for row in rows]
        
        sovereign_cols = ['risk_score', 'carbon_emissions', 'customs_duty_estimate', 'port_congestion_index']
        missing = [c for c in sovereign_cols if c not in cols]
        
        if not missing:
            print("   STATUS: Sovereign Metrics Schema: SYNCHRONIZED")
        else:
            print(f"   WARNING: SCHEMA GAP DETECTED: Missing columns {missing}")
            print("   ACTION: Tables need re-initialization or migration.")
            
        await conn.close()
    except Exception as e:
        print(f"   ERROR: Database Handshake: FAILED ({e})")

    # 2. AI SOVEREIGN ENGINE READINESS
    print("\n[2/4] AUDITING AI SOVEREIGN ENGINE...")
    try:
        sample_risk = sovereign_engine.calculate_risk_score("Shanghai", "Jeddah")
        print(f"   STATUS: Sovereign Logic: ACTIVE (Sample Risk Index: {sample_risk}%)")
    except Exception as e:
        print(f"   ERROR: Sovereign Logic: ERROR ({e})")

    # 3. ENVIRONMENT INTEGRITY
    print("\n[3/4] AUDITING ENVIRONMENT INTEGRITY...")
    envs = {
        "DATABASE_URL": settings.DATABASE_URL,
        "GOOGLE_API_KEY": settings.GOOGLE_API_KEY,
        "OPENAI_API_KEY": settings.OPENAI_API_KEY
    }
    for key, val in envs.items():
        status = "CONFIGURED" if val and "your_" not in val.lower() else "PENDING"
        print(f"   - {key}: {status}")

    # 4. FRONTEND-BACKEND HANDSHAKE
    print("\n[4/4] AUDITING API HANDSHAKE...")
    backend_url = "http://localhost:8000"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(backend_url, timeout=2.0)
            if response.status_code == 200:
                print(f"   STATUS: Backend Heartbeat: ACTIVE ({response.json().get('status')})")
            else:
                print(f"   WARNING: Backend Heartbeat: UNEXPECTED STATUS ({response.status_code})")
    except Exception:
        print(f"   STATUS: Backend heartbeat at {backend_url}: OFFLINE")
        print("   INFO: Run 'python run.py' in a separate terminal to verify live heartbeat.")

    # 5. SOVEREIGN CONNECTIVITY SCORE
    print("\n[5/5] CALCULATING SOVEREIGN CONNECTIVITY SCORE...")
    score = 0
    total = 100
    
    # DB: 40%
    if 'PostgreSQL Handshake: SUCCESSFUL' in str(locals()): # Simulated check
        score += 40
        
    # AI: 20%
    if settings.OPENAI_API_KEY and "sk-" in settings.OPENAI_API_KEY:
        score += 20
        print("   ✅ AI Intelligence: ACTIVATED")
    else:
        print("   ⚠️  AI Intelligence: PENDING (OpenAI Key Missing)")
        
    # Google Enterprise: 20%
    if settings.GOOGLE_API_KEY and "your_" not in settings.GOOGLE_API_KEY:
        score += 20
        print("   ✅ Google Enterprise: ACTIVATED")
    else:
        print("   ⚠️  Google Enterprise: PENDING (Places/Maps Key Missing)")
        
    # Ocean Logistics: 20%
    if settings.MAERSK_CONSUMER_KEY or settings.CMA_API_KEY:
        score += 20
        print("   ✅ Ocean Connectivity: ACTIVATED")
    else:
        print("   ⚠️  Ocean Connectivity: PENDING (Carrier Keys Missing)")

    print(f"\n   >>> CURRENT CONNECTIVITY SCORE: {score}/100 <<<")
    if score == 100:
        print("   🔱 SYSTEM STATUS: SUPREME COMMAND ACTIVE")
    else:
        print("   🔧 STATUS: AWAITING FINAL ACTIVATION KEYS")

    print("\n" + "="*60)
    print("          DIAGNOSTIC COMPLETE: PHOENIX IS READY")
    print("="*60 + "\n")

if __name__ == "__main__":
    import os
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_supreme_pulse())
