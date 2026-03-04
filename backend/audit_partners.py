import asyncio
from app.db.session import AsyncSessionLocal
from app.models.forwarder import Forwarder
from sqlalchemy import select, update

async def audit_partners():
    async with AsyncSessionLocal() as db:
        # Get all partners
        res = await db.execute(select(Forwarder))
        fwds = res.scalars().all()
        print(f"Total Partners in DB: {len(fwds)}")
        
        for f in fwds:
            print(f"- {f.company_name}: Status={f.status}, Verified={f.is_verified}")
            
        # Implementation of BOAT Activation: Ensure all verified or pending partners are ACTIVE
        # to ensure the directory is populated for the user.
        await db.execute(
            update(Forwarder)
            .where(Forwarder.status == "PENDING")
            .values(status="ACTIVE", is_verified=True)
        )
        await db.commit()
        print("BOAT ACTION: All PENDING partners activated for directory visibility.")

if __name__ == "__main__":
    asyncio.run(audit_partners())
