from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app import crud
from typing import Dict

from pydantic import BaseModel

router = APIRouter()

from app.api import deps
from app.models.user import User
import json

@router.get("/stats/me", response_model=Dict)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Returns real-time dashboard statistics via Auth Token.
    """
    try:
        # ROLE-BASED INTELLIGENCE DISPATCH
        if current_user.role == "forwarder":
            from app.api.routers.forwarders import forwarder_dashboard
            # We call the existing forwarder_dashboard logic but adapt it for stats/me
            f_stats = await forwarder_dashboard(current_user.sovereign_id, db)
            
            # Format forwarder stats to match the expected unified structure
            return {
                "active_shipments": f_stats.get("metrics", {}).get("active_bids", 0),
                "total_shipments": f_stats.get("metrics", {}).get("total_quotes_submitted", 0),
                "delivered_shipments": f_stats.get("metrics", {}).get("won_bids", 0),
                "pending_tasks_count": 0, # Forwarder tasks coming soon
                "kanban_shipments": [
                   {
                        "id": q["request_id"],
                        "company": "Shipper",
                        "desc": f"{q['cargo_type']} ({q['origin']} ➔ {q['destination']})",
                        "date": q["submitted_at"][:10],
                        "comments": q["your_position"],
                        "views": 1,
                        "status": "processing" if q["status"] == "OPEN" else "delivered",
                        "mode": q["cargo_type"],
                        "highlight": q["your_position"] == 1
                   } for q in f_stats.get("quotes", [])
                ],
                "recent_activity": [] # Add forwarder activity if needed
            }

        stats = await crud.marketplace.get_dashboard_stats(db, user_id=current_user.sovereign_id)
        
        # 1. Format Shipments for Kanban Board (The "King Maker" View)
        raw_shipments = stats.pop("shipments", [])
        formatted_shipments = []
        
        for s in raw_shipments:
            # Sovereign Status Mapping (Alignment with n8n workflow)
            kanban_status = "processing"
            if s.status == "OPEN": 
                kanban_status = "processing"
            elif s.status == "CLOSED": 
                kanban_status = "delivered"
            elif s.status == "CANCELLED":
                kanban_status = "customs" # Using 'customs' as a visual proxy for 'Flagged'
                
            # Highlight Logic (High Precision)
            is_highlight = s.is_hazardous or (s.weight_kg and s.weight_kg > 10000)
            
            formatted_shipments.append({
                "id": s.request_id,
                "company": s.user_name or s.user_email,
                "desc": f"{s.commodity or 'General Cargo'} ({s.cargo_type})",
                "date": s.created_at.strftime("%d %b") if s.created_at else "Now",
                "comments": s.quotation_count or 0,
                "views": 1,
                "status": kanban_status,
                "mode": s.cargo_type or "Ocean",
                "highlight": is_highlight
            })
            
        stats["kanban_shipments"] = formatted_shipments
        
        # 2. Add Pending Tasks Count (Strategic Synchronization)
        from app.models.task import Task
        from sqlalchemy import func
        task_count_result = await db.execute(
            select(func.count(Task.id))
            .filter(Task.user_id == str(current_user.id), Task.status == "PENDING")
        )
        stats["pending_tasks_count"] = task_count_result.scalar() or 0

        # 3. Add Recent Activity (The "Realness" Factor)
        recent_activities = await crud.activity.get_multi_by_user(db, user_id=str(current_user.id), limit=20)
        
        # Build Response List
        activity_list = []
        
        for act in recent_activities:
            metadata = {}
            if act.extra_data:
                try:
                    metadata = json.loads(act.extra_data)
                except:
                    metadata = {}
            
            # Smart URL Construction for "Resume" Feature
            resume_url = "/dashboard"
            if act.action == "SEARCH":
                origin = metadata.get("origin", "")
                dest = metadata.get("destination", "")
                cont = metadata.get("container", "40FT")
                resume_url = f"/results?origin={origin}&destination={dest}&container={cont}"
            elif act.action == "BOOKING_CREATED":
                ref = metadata.get("reference", act.entity_id)
                resume_url = f"/booking/confirmation?id={ref}"
            elif act.action == "TASK_COMPLETED" or act.action == "TASK_REOPENED" or act.action == "TASK_CREATED":
                resume_url = "/dashboard/tasks"
            elif act.action == "PROFILE_UPDATE" or act.action == "SECURITY_UPDATE":
                resume_url = "/dashboard/settings"
            elif act.action == "MARKETPLACE_SUBMIT":
                resume_url = f"/marketplace/quotes/{act.entity_id}"
                
            activity_list.append({
                "id": act.id,
                "action": act.action,
                "entity": f"{act.entity_type} #{act.entity_id}" if act.entity_id else "System",
                "timestamp": act.created_at.isoformat(),
                "metadata": metadata, # Return parsed JSON object, not string
                "url": resume_url
            })

        stats["recent_activity"] = activity_list
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.get("/activity/full", response_model=Dict)
async def get_full_activity_history(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Returns full audit log for the current user (high-fidelity paged history).
    """
    try:
        activities = await crud.activity.get_multi_by_user(db, user_id=str(current_user.id), limit=limit, offset=offset)
        
        # Build Response List
        activity_list = []
        for act in activities:
            metadata = {}
            if act.extra_data:
                try: metadata = json.loads(act.extra_data)
                except: metadata = {}
                
            resume_url = "/dashboard"
            if act.action == "SEARCH":
                resume_url = f"/results?origin={metadata.get('origin', '')}&destination={metadata.get('destination', '')}&container={metadata.get('container', '40FT')}"
            elif act.action == "BOOKING_CREATED":
                resume_url = f"/booking/confirmation?id={metadata.get('reference', act.entity_id)}"
            elif "TASK" in act.action:
                resume_url = "/dashboard/tasks"
            elif "PROFILE" in act.action or "SECURITY" in act.action:
                resume_url = "/dashboard/settings"
            elif act.action == "MARKETPLACE_SUBMIT":
                resume_url = f"/marketplace/quotes/{act.entity_id}"
                
            activity_list.append({
                "id": act.id,
                "action": act.action,
                "entity": f"{act.entity_type} #{act.entity_id}" if act.entity_id else "System",
                "timestamp": act.created_at.isoformat(),
                "metadata": metadata,
                "url": resume_url
            })
            
        return {"activities": activity_list, "total": len(activity_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activity history: {str(e)}")


class LeadCreate(BaseModel):
    name: str = "Anonymous"
    email: str
    company: str = "Unknown"
    interest: str = "General"

@router.post("/leads")
async def create_lead(lead: LeadCreate):
    """
    # SOVEREIGN LEAD CAPTURE
    Public endpoint for 'Book Demo' and 'Start Trial'.
    """
    print(f"[LEAD CAPTURE] New Interest: {lead.email} ({lead.company}) - {lead.interest}")
    # In a real scenario, this would save to DB or CRM.
    # For 'Best of All Time' demo, we log and return success.
    return {"success": True, "message": "Oracle has received your request. Dispatching sales team."}

@router.get("/market-ticker")
async def get_market_ticker():
    """
    # SOVEREIGN MARKET WATCH (Pure n8n Era)
    Returns fixed indices for the ticker in Phase 1.
    """
    return {
        "status": "STABLE",
        "pulse": 0.98,
        "note": "Market intelligence is now handled by n8n Brain."
    }
