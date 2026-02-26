from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from typing import List, Optional, Any
from datetime import datetime, timedelta

class CRUDMarketplace:
    async def get_dashboard_stats(self, db: AsyncSession, user_id: str) -> dict:
        """
        # SOVEREIGN MIRROR TELEMETRY
        Calculates stats from n8n-synced 'requests' and 'quotations'.
        """
        # 1. Active Requests (Shipments)
        # We treat 'OPEN' requests as the active 'cargo in motion' for the dashboard
        result = await db.execute(
            select(MarketplaceRequest)
            .filter(MarketplaceRequest.user_sovereign_id == user_id)
            .order_by(MarketplaceRequest.submitted_at.desc())
        )
        all_requests = result.scalars().all()
        
        active_requests = [r for r in all_requests if r.status == "OPEN"]
        total_active = len(active_requests)
        
        # 2. Total Cargo Volume (TEU-esque logic)
        # Logic: FCL Container = ~2 units, LCL/Air = ~0.5 units for the visualization
        total_volume = 0
        for r in active_requests:
            if "FCL" in (r.cargo_type or "").upper():
                total_volume += 2
            else:
                total_volume += 0.5
        
        # 3. Fulfillment Rate (Quotes vs Requests)
        # Percentage of requests that have at least one bid
        quoted_requests = [r for r in all_requests if (r.quotation_count or 0) > 0]
        fulfillment_rate = (len(quoted_requests) / len(all_requests) * 100) if all_requests else 100.0
        
        # 4. Timeline Data (Daily Request Volume)
        chart_data = []
        today = datetime.utcnow()
        for i in range(6, -1, -1):
            day_target = today - timedelta(days=i)
            count = 0
            for r in all_requests:
                if r.submitted_at and r.submitted_at.date() == day_target.date():
                    count += 1
            
            chart_data.append({
                "label": day_target.strftime("%a")[0],
                "value": count
            })

        return {
            "active_shipments": total_active,
            "containers": total_volume,
            "on_time_rate": f"{fulfillment_rate:.1f}%", # Re-purposed as 'Efficiency/Fulfillment'
            "chart_data": chart_data,
            "success": True,
            "shipments": all_requests # Passed to Kanban
        }

marketplace = CRUDMarketplace()
