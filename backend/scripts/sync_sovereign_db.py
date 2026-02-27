import asyncio
from app.db.session import engine, Base
from app.models.marketplace import MarketplaceRequest, MarketplaceBid, ForwarderBidStatus, N8nEventLog, RejectedAttempt, N8nBroadcastLog, N8nAnalytics

async def sync_database():
    """
    Sovereign Sync: Ensures all 2026 Logic Hardening tables are initialized in the Heart.
    """
    print("🌍 [OMEGO] INITIALIZING SOVEREIGN MIRROR...")
    async with engine.begin() as conn:
        # This will create any missing tables defined in the models
        await conn.run_sync(Base.metadata.create_all)
    print("✅ [OMEGO] HEART SYNCHRONIZED. AUDIT TABLES ARE LIVE.")

if __name__ == "__main__":
    asyncio.run(sync_database())
