"""Pre-flight check: Verify everything WF1 needs is in the Neon database."""
import asyncio
import logging
logging.disable(logging.CRITICAL)
from app.db.session import engine
from sqlalchemy import text

async def preflight():
    print("=" * 60)
    print("PRE-FLIGHT CHECK: Is everything ready for WF1?")
    print("=" * 60)
    
    async with engine.connect() as c:
        # 1. Check the request exists
        r = await c.execute(text("SELECT request_id, user_sovereign_id, user_email, origin, destination, cargo_type, status FROM requests WHERE request_id = 'OMEGO-0001-REQ-01'"))
        req = r.fetchone()
        if req:
            print(f"\n[1] REQUEST: FOUND")
            print(f"    ID: {req[0]}")
            print(f"    User: {req[1]} ({req[2]})")
            print(f"    Route: {req[3]} -> {req[4]}")
            print(f"    Cargo: {req[5]}")
            print(f"    Status: {req[6]}")
        else:
            print("\n[1] REQUEST: MISSING!")

        # 2. Check the user exists
        r = await c.execute(text("SELECT sovereign_id, email, full_name, role FROM users WHERE sovereign_id = 'OMEGO-0001'"))
        user = r.fetchone()
        if user:
            print(f"\n[2] USER: FOUND")
            print(f"    Sovereign: {user[0]}")
            print(f"    Email: {user[1]}")
            print(f"    Name: {user[2]}")
            print(f"    Role: {user[3]}")
        else:
            print("\n[2] USER: MISSING!")

        # 3. Check forwarders exist with FCL specialization
        r = await c.execute(text("SELECT forwarder_id, company_name, email, specializations, status FROM forwarders WHERE status = 'APPROVED'"))
        fwds = r.fetchall()
        print(f"\n[3] FORWARDERS: {len(fwds)} found")
        for f in fwds:
            print(f"    {f[0]}: {f[1]} ({f[2]}) - {f[3]} [{f[4]}]")

        # 4. Check WF1 SQL queries will work
        print(f"\n[4] WF1 QUERY SIMULATION:")
        
        # WF1 Query 1: Read Request
        r = await c.execute(text("SELECT * FROM requests WHERE request_id = 'OMEGO-0001-REQ-01'"))
        print(f"    SELECT * FROM requests WHERE request_id='OMEGO-0001-REQ-01' -> {len(r.fetchall())} rows")
        
        # WF1 Query 2: Read User
        r = await c.execute(text("SELECT * FROM users WHERE sovereign_id = 'OMEGO-0001'"))
        print(f"    SELECT * FROM users WHERE sovereign_id='OMEGO-0001' -> {len(r.fetchall())} rows")
        
        # WF1 Query 3: Read Active Forwarders
        r = await c.execute(text("SELECT * FROM forwarders WHERE status = 'APPROVED' OR status = 'ACTIVE'"))
        print(f"    SELECT * FROM forwarders WHERE status IN ('APPROVED','ACTIVE') -> {len(r.fetchall())} rows")

        print("\n" + "=" * 60)
        if req and user and len(fwds) > 0:
            print("ALL CHECKS PASSED! READY TO FIRE WF1!")
        else:
            print("SOME CHECKS FAILED - FIX BEFORE TESTING")
        print("=" * 60)

asyncio.run(preflight())
