import asyncio
from sqlalchemy import text
from app.db.session import engine

async def check_schema():
    async with engine.connect() as conn:
        print("Checking 'users' table schema...")
        result = await conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users';"))
        columns = result.fetchall()
        
        found_sovereign = False
        found_onboarding = False
        
        print(f"{'COLUMN':<25} {'TYPE':<15} {'NULLABLE'}")
        print("-" * 50)
        for col in columns:
            print(f"{col[0]:<25} {col[1]:<15} {col[2]}")
            if col[0] == 'sovereign_id':
                found_sovereign = True
            if col[0] == 'onboarding_completed':
                found_onboarding = True
        
        print("-" * 50)
        if found_sovereign and found_onboarding:
            print("✅ SUCCESS: Sovereign Identity Schema is ACTIVE.")
            print("   - sovereign_id column exists.")
            print("   - onboarding_completed column exists.")
        else:
            print("❌ FAILURE: Schema mismatch.")
            if not found_sovereign: print("   - Missing 'sovereign_id'")
            if not found_onboarding: print("   - Missing 'onboarding_completed'")

if __name__ == "__main__":
    import asyncio
    asyncio.run(check_schema())
