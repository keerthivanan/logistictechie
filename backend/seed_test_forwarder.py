import asyncio
from app.db.session import engine
from sqlalchemy import text
from datetime import datetime, timedelta

async def seed_test_forwarder():
    # 🎯 CONFIGURATION: Change this to the email you will send tests from!
    TEST_EMAIL = "quote@omegoonline.com"
    TEST_NAME = "OMEGO Test Logistics"
    TEST_ID = "REG-OMEGO-TEST-01"

    async with engine.connect() as conn:
        print(f"🚀 Seeding test forwarder: {TEST_NAME} ({TEST_EMAIL})")
        
        # 1. 🛡️ Check if exists
        check = await conn.execute(text("SELECT id FROM forwarders WHERE email = :email"), {"email": TEST_EMAIL})
        if check.fetchone():
            print("⚠️ Forwarder already exists. Skipping.")
            return

        # 2. ⚡ Insert Mock Partner
        await conn.execute(text("""
            INSERT INTO forwarders (
                forwarder_id, company_name, email, contact_person, status, 
                is_verified, is_paid, reliability_score, registered_at, expires_at
            ) VALUES (
                :fid, :name, :email, :contact, 'ACTIVE', 
                true, true, 5.0, :now, :expiry
            )
        """), {
            "fid": TEST_ID,
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "contact": "Test Pilot",
            "now": datetime.utcnow(),
            "expiry": datetime.utcnow() + timedelta(days=365)
        })
        
        await conn.commit()
        print(f"✅ SUCCESSFULLY SEEDED: {TEST_NAME} is now a Registered Partner.")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(seed_test_forwarder())
