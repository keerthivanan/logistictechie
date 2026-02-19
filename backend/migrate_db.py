import asyncio
from app.db.session import engine
from app.models.user import Base
from sqlalchemy import text

async def apply_migrations():
    print("[SYSTEM] APPLYING SOVEREIGN IDENTITY MIGRATIONS...")
    async with engine.begin() as conn:
        try:
            print("[MIGRATION] Adding 'sovereign_id' column...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS sovereign_id VARCHAR UNIQUE;"))
            await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_sovereign_id ON users (sovereign_id);"))
            
            print("[MIGRATION] Adding 'onboarding_completed' column...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;"))

            print("[MIGRATION] Adding 'survey_responses' column...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS survey_responses VARCHAR;"))
            
            print("[MIGRATION] Making 'password_hash' nullable (Social-Only)...")
            await conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;"))

            print("[SUCCESS] COMPLETED.")
        except Exception as e:
            print(f"[ERROR] Migration Failed: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(apply_migrations())
