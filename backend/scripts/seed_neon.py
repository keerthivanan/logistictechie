"""Seed Neon Cloud Database with test data for WF1 testing."""
import asyncio
import logging
logging.disable(logging.CRITICAL)
from app.db.session import engine
from sqlalchemy import text
import uuid

async def seed():
    async with engine.begin() as conn:
        uid = str(uuid.uuid4())
        
        # 1. Insert test user
        await conn.execute(text("""
            INSERT INTO users (id, email, full_name, sovereign_id, phone_number, role, password_hash, is_active)
            VALUES (:id, :email, :name, :sid, :phone, :role, :pw, true)
            ON CONFLICT (email) DO NOTHING
        """), {"id": uid, "email": "logistics.user13@gmail.com", "name": "Test Client", "sid": "OMEGO-0001", "phone": "+1234567890", "role": "client", "pw": "placeholder"})
        print("[+] Test User inserted")

        # 2. Insert test forwarders
        for i, (fid, company, spec) in enumerate([
            ("FWD-001", "Global Freight Solutions", "FCL,LCL,AIR"),
            ("FWD-002", "Pacific Maritime Co.", "FCL,LCL"),
            ("FWD-003", "Express Cargo Lines", "FCL,AIR")
        ]):
            await conn.execute(text("""
                INSERT INTO forwarders (id, forwarder_id, email, company_name, contact_person, phone, country, specializations, status)
                VALUES (:id, :fid, :email, :company, :contact, :phone, :country, :spec, 'APPROVED')
                ON CONFLICT DO NOTHING
            """), {"id": str(uuid.uuid4()), "fid": fid, "email": f"forwarder{i+1}@test.com", "company": company, "contact": "Agent", "phone": "+1000000000", "country": "Global", "spec": spec})
        print("[+] 3 Test Forwarders inserted")

        # 3. Insert test request
        await conn.execute(text("""
            INSERT INTO requests (request_id, user_sovereign_id, user_email, user_name, user_phone,
                origin, origin_type, destination, destination_type, cargo_type,
                commodity, packing_type, quantity, weight_kg, dimensions,
                is_stackable, is_hazardous, needs_insurance,
                special_requirements, incoterms, currency, status)
            VALUES ('OMEGO-0001-REQ-01', 'OMEGO-0001', 'logistics.user13@gmail.com', 'Test Client', '+1234567890',
                'Shanghai, China', 'PORT', 'Los Angeles, USA', 'PORT', 'FCL',
                'Electronics', 'PALLETS', 2, 5000.0, '2x 40ft HC',
                true, false, true,
                'Live Test - Neon Cloud DB', 'FOB', 'USD', 'OPEN')
            ON CONFLICT (request_id) DO NOTHING
        """))
        print("[+] Test Request inserted: OMEGO-0001-REQ-01")

        # Verify
        for table in ['users', 'forwarders', 'requests']:
            r = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            print(f"    {table}: {r.scalar()} rows")
        
        print("\n[OK] Database seeded! Ready for WF1 test!")

asyncio.run(seed())
