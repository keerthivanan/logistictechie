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
        stats = await crud.booking.get_dashboard_stats(db, user_id=str(current_user.id))
        
        # 1. Format Shipments for Kanban Board (The "King Maker" View)
        raw_shipments = stats.pop("shipments", [])
        formatted_shipments = []
        
        for s in raw_shipments:
            # Parse Details
            try:
                cargo = json.loads(s.cargo_details) if isinstance(s.cargo_details, str) else s.cargo_details
                contact = json.loads(s.contact_details) if isinstance(s.contact_details, str) else s.contact_details
            except:
                cargo = {}
                contact = {}
                
            # Status Mapping
            kanban_status = "processing"
            if s.status == "CONFIRMED": kanban_status = "processing"
            elif s.status == "SHIPPED": kanban_status = "transit"
            elif s.status == "DELIVERED": kanban_status = "delivered"
            elif s.status == "CUSTOMS_HOLD": kanban_status = "customs"
            
            # Highlight Logic (King Maker Feature)
            is_highlight = "High Value" in str(cargo) or "Hazardous" in str(cargo)
            
            formatted_shipments.append({
                "id": s.booking_reference,
                "company": contact.get("company_name", "Sovereign Request"),
                "desc": f"{cargo.get('commodity', 'General Cargo')} ({cargo.get('container', '40FT')})",
                "date": s.created_at.strftime("%d %b"),
                "comments": 0, # Placeholder for future messaging feature
                "views": 1,
                "status": kanban_status,
                "mode": "Air" if "Air" in str(cargo) else "Ocean",
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
    # SOVEREIGN MARKET WATCH
    Returns live volatile indices for the ticker.
    """
    from app.services.sovereign import sovereign_engine
    return sovereign_engine.get_market_ticker()
