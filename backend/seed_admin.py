import asyncio
from app.db.session import AsyncSessionLocal
from app.crud.user import user as user_crud
from app.core import security

async def seed_admin():
    async with AsyncSessionLocal() as db:
        admin_email = "admin@phoenix.sa"
        existing_user = await user_crud.get_by_email(db, email=admin_email)
        
        if not existing_user:
            print(f"[SEED] Creating Sovereign Admin: {admin_email}")
            await user_crud.create(
                db,
                email=admin_email,
                password="GlobalOracle2026!",
                full_name="Logistics Oracle Admin",
                company_name="Phoenix Logistics OS"
            )
            print("[SEED] Admin Node Established.")
        else:
            print("[SEED] Admin Node already present.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
