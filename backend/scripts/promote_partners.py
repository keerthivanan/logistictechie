import asyncio
from app.db.session import engine
from sqlalchemy import text
from datetime import datetime, timedelta

async def promote_test_accounts():
    # 🎯 CONFIGURATION: Put your 2 Forwarder emails here!
    FORWARDER_EMAILS = [
        "forwarder1@gmail.com", # REPLACE THIS
        "forwarder2@gmail.com"  # REPLACE THIS
    ]

    async with engine.connect() as conn:
        print(f"🚀 Promoting {len(FORWARDER_EMAILS)} accounts to OMEGO Partners...")
        
        for email in FORWARDER_EMAILS:
            email = email.lower().strip()
            # 1. Check if user exists in 'users' table first
            user_check = await conn.execute(text("SELECT sovereign_id FROM users WHERE email = :email"), {"email": email})
            user = user_check.fetchone()
            
            if not user:
                print(f"❌ User NOT Found: {email}. Please SIGN UP on the website first!")
                continue

            sid = user[0]
            if not sid.startswith("REG-"):
                new_sid = f"REG-{sid}"
                print(f"🔄 Upgrading Identity: {sid} -> {new_sid}")
                await conn.execute(text("UPDATE users SET role = 'forwarder', sovereign_id = :nsid WHERE email = :email"), 
                                   {"nsid": new_sid, "email": email})
            else:
                new_sid = sid
                await conn.execute(text("UPDATE users SET role = 'forwarder' WHERE email = :email"), {"email": email})

            # 2. Ensure record exists in 'forwarders' table
            fwd_check = await conn.execute(text("SELECT id FROM forwarders WHERE email = :email"), {"email": email})
            if not fwd_check.fetchone():
                print(f"✨ Creating Partner Profile for {email}...")
                await conn.execute(text("""
                    INSERT INTO forwarders (
                        forwarder_id, company_name, email, status, 
                        is_verified, is_paid, reliability_score, registered_at, expires_at
                    ) VALUES (
                        :fid, :name, :email, 'ACTIVE', 
                        true, true, 5.0, :now, :expiry
                    )
                """), {
                    "fid": new_sid,
                    "name": f"Partner ({email.split('@')[0]})",
                    "email": email,
                    "now": datetime.utcnow(),
                    "expiry": datetime.utcnow() + timedelta(days=90)
                })
            else:
                print(f"✅ Partner profile already exists for {email}.")
        
        await conn.commit()
        print("\n🏆 SETUP COMPLETE. Your forwarders are now ready to receive high-fidelity requests!")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(promote_test_accounts())
