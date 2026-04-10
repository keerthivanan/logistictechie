from fastapi import APIRouter, Depends, HTTPException, Query
from urllib.parse import urlencode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app import crud
from typing import Dict
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

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
            from app.api.routers.forwarders import get_forwarder_bids
            f_bids_res = await get_forwarder_bids(db, current_user)
            f_bids = f_bids_res.get("bids", [])
            
            from app.models.task import Task
            fwd_task_count_res = await db.execute(
                select(func.count(Task.id))
                .filter(Task.user_id == str(current_user.id), Task.status == "PENDING")
            )
            fwd_pending_tasks = fwd_task_count_res.scalar() or 0

            fwd_activities = await crud.activity.get_multi_by_user(db, user_id=str(current_user.id), limit=10)
            fwd_activity_list = [
                {
                    "id": act.id,
                    "action": act.action,
                    "entity": f"{act.entity_type} #{act.entity_id}" if act.entity_id else "System",
                    "timestamp": act.created_at.isoformat(),
                    "url": "/dashboard",
                }
                for act in fwd_activities
            ]

            # Unread message count for forwarder — single subquery
            fwd_unread = 0
            try:
                from app.models.conversation import Conversation, ChatMessage
                fwd_unread_res = await db.execute(
                    select(func.count(ChatMessage.id)).where(
                        ChatMessage.conversation_id.in_(
                            select(Conversation.id).where(Conversation.forwarder_id == current_user.sovereign_id)
                        ),
                        ChatMessage.sender_id != current_user.sovereign_id,
                        ChatMessage.is_read == False,  # noqa: E712
                        ChatMessage.sender_role != "SYSTEM",
                    )
                )
                fwd_unread = fwd_unread_res.scalar() or 0
            except Exception:
                fwd_unread = 0

            return {
                "active_shipments": len([b for b in f_bids if b["request_status"] == "OPEN"]),
                "total_shipments": len(f_bids),
                "delivered_shipments": len([b for b in f_bids if b["bid_status"] == "COMPLETED"]),
                "pending_tasks_count": fwd_pending_tasks,
                "unread_messages_count": fwd_unread,
                "kanban_shipments": [
                    {
                        "id": b["request_id"],
                        "company": f"{b['origin']} → {b['destination']}",
                        "desc": f"{b['cargo_type']} ({b['origin']} ➔ {b['destination']})",
                        "date": b["attempted_at"].strftime("%d %b") if b["attempted_at"] else "Now",
                        "comments": b["bid_status"],
                        "views": 1,
                        "status": "processing" if b["request_status"] == "OPEN" else "delivered",
                        "mode": b["cargo_type"],
                        "highlight": b["bid_status"] == "ANSWERED"
                    } for b in f_bids
                ],
                "recent_activity": fwd_activity_list,
            }

        # SHIPPER LOGIC: Enhanced with Nested Quotes
        from app.api.routers.marketplace import get_my_requests
        s_requests_res = await get_my_requests(db, current_user)
        s_requests = s_requests_res.get("requests", [])
        
        formatted_shipments = []
        for r in s_requests:
            kanban_status = "processing"
            if r["status"] == "OPEN": kanban_status = "processing"
            elif r["status"] == "CLOSED": kanban_status = "delivered"
            
            q_count = r.get("quotation_count") or 0
            sub_at = r.get("submitted_at")
            formatted_shipments.append({
                "id": r["request_id"],
                "company": current_user.full_name or "Client",
                "desc": f"{r['cargo_type']} ({r['origin']} ➔ {r['destination']})",
                "date": sub_at.strftime("%d %b") if sub_at else "Now",
                "comments": q_count,
                "views": 1,
                "status": kanban_status,
                "mode": r["cargo_type"],
                "highlight": q_count > 0
            })
        
        stats = {
            "active_shipments": len([r for r in s_requests if r["status"] == "OPEN"]),
            "total_shipments": len(s_requests),
            "delivered_shipments": len([r for r in s_requests if r["status"] == "CLOSED"]),
            "kanban_shipments": formatted_shipments
        }
        
        # 2. Add Pending Tasks Count (Strategic Synchronization)
        from app.models.task import Task
        task_count_result = await db.execute(
            select(func.count(Task.id))
            .filter(Task.user_id == str(current_user.id), Task.status == "PENDING")
        )
        stats["pending_tasks_count"] = task_count_result.scalar() or 0

        # recent_activity is NOT included here — fetched lazily by frontend via /activity/full
        stats["recent_activity"] = []

        # Unread message count — single subquery, no round-trip for conv_ids
        try:
            from app.models.conversation import Conversation, ChatMessage
            unread_res = await db.execute(
                select(func.count(ChatMessage.id)).where(
                    ChatMessage.conversation_id.in_(
                        select(Conversation.id).where(Conversation.shipper_id == current_user.sovereign_id)
                    ),
                    ChatMessage.sender_id != current_user.sovereign_id,
                    ChatMessage.is_read == False,  # noqa: E712
                    ChatMessage.sender_role != "SYSTEM",
                )
            )
            stats["unread_messages_count"] = unread_res.scalar() or 0
        except Exception:
            stats["unread_messages_count"] = 0

        return stats
    except Exception as e:
        logger.error(f"[DASHBOARD] stats/me error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load dashboard. Please try again.")

@router.get("/activity/full", response_model=Dict)
async def get_full_activity_history(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
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
                except Exception: metadata = {}
                
            resume_url = "/dashboard"
            if act.action == "SEARCH":
                resume_url = f"/results?{urlencode({'origin': metadata.get('origin', ''), 'destination': metadata.get('destination', ''), 'container': metadata.get('container', '40FT')})}"
            elif act.action == "BOOKING_CREATED":
                resume_url = f"/booking/confirmation?id={metadata.get('reference', act.entity_id)}"
            elif "TASK" in act.action:
                resume_url = "/dashboard/tasks"
            elif "PROFILE" in act.action or "SECURITY" in act.action:
                resume_url = "/profile"
            elif act.action == "MARKETPLACE_SUBMIT":
                resume_url = f"/marketplace/{act.entity_id}"
            elif act.action == "PARTNER_APPLIED":
                resume_url = "/dashboard/partner"
            elif act.action == "BID_SUBMITTED":
                resume_url = f"/marketplace/{act.entity_id}"

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
        logger.error(f"[DASHBOARD] activity/full error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to load activity history. Please try again.")


@router.get("/notifications/", response_model=Dict)
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Structured notification feed — unread messages + new quotes received.
    Polled every 15s by the dashboard layout.
    """
    from app.models.conversation import Conversation, ChatMessage
    from app.models.marketplace import MarketplaceBid
    from datetime import datetime, timezone, timedelta

    notifications = []

    try:
        # ── 1. Unread messages ────────────────────────────────────────────────
        if current_user.role == "forwarder":
            conv_filter = Conversation.forwarder_id == current_user.sovereign_id
        else:
            conv_filter = Conversation.shipper_id == current_user.sovereign_id

        convs_res = await db.execute(
            select(Conversation.id, Conversation.public_id).where(conv_filter)
        )
        convs = convs_res.all()
        conv_ids = [c.id for c in convs]
        conv_pub = {c.id: c.public_id for c in convs}

        if conv_ids:
            unread_msgs_res = await db.execute(
                select(ChatMessage)
                .where(
                    ChatMessage.conversation_id.in_(conv_ids),
                    ChatMessage.sender_id != current_user.sovereign_id,
                    ChatMessage.is_read == False,  # noqa: E712
                    ChatMessage.sender_role != "SYSTEM",
                )
                .order_by(ChatMessage.created_at.desc())
                .limit(10)
            )
            for msg in unread_msgs_res.scalars().all():
                diff = datetime.now(timezone.utc) - msg.created_at.replace(tzinfo=timezone.utc)
                m = int(diff.total_seconds() // 60)
                time_ago = "Just now" if m < 1 else f"{m}m ago" if m < 60 else f"{m // 60}h ago"
                notifications.append({
                    "type": "NEW_MESSAGE",
                    "title": "New message",
                    "body": (msg.content or "")[:80],
                    "link": f"/dashboard/messages/{conv_pub.get(msg.conversation_id, '')}",
                    "timestamp": msg.created_at.isoformat(),
                    "time_ago": time_ago,
                })

        # ── 2. New quotes on user's requests (last 48h) ───────────────────────
        if current_user.role != "forwarder":
            from app.models.marketplace import MarketplaceRequest
            from datetime import datetime as _dt
            cutoff = _dt.utcnow() - timedelta(hours=48)
            # Get the user's request IDs
            req_ids_res = await db.execute(
                select(MarketplaceRequest.request_id)
                .where(MarketplaceRequest.user_sovereign_id == current_user.sovereign_id)
            )
            req_ids = [r[0] for r in req_ids_res.all()]
            if req_ids:
                bids_res = await db.execute(
                    select(MarketplaceBid)
                    .where(
                        MarketplaceBid.request_id.in_(req_ids),
                        MarketplaceBid.received_at >= cutoff,
                    )
                    .order_by(MarketplaceBid.received_at.desc())
                    .limit(5)
                )
                for bid in bids_res.scalars().all():
                    received = bid.received_at if bid.received_at.tzinfo else bid.received_at.replace(tzinfo=timezone.utc)
                    diff = datetime.now(timezone.utc) - received
                    m = int(diff.total_seconds() // 60)
                    time_ago = "Just now" if m < 1 else f"{m}m ago" if m < 60 else f"{m // 60}h ago"
                    notifications.append({
                        "type": "NEW_QUOTE",
                        "title": "New quote received",
                        "body": f"{bid.forwarder_company} quoted {bid.currency} {int(bid.total_price):,}",
                        "link": "/dashboard/shipments",
                        "timestamp": bid.received_at.isoformat(),
                        "time_ago": time_ago,
                    })
    except Exception as e:
        logger.warning(f"[NOTIFICATIONS] Error: {e}")

    # Sort by timestamp desc, cap at 15
    notifications.sort(key=lambda n: n["timestamp"], reverse=True)
    notifications = notifications[:15]

    # Bell badge = unread messages only (quotes are informational, not "unread")
    unread_msg_count = sum(1 for n in notifications if n["type"] == "NEW_MESSAGE")

    return {
        "notifications": notifications,
        "unread_count": unread_msg_count,
    }


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
    logger.info(f"[LEAD CAPTURE] New Interest: {lead.email} ({lead.company}) - {lead.interest}")
    # In a real scenario, this would save to DB or CRM.
    # For 'Best of All Time' demo, we log and return success.
    return {"success": True, "message": "Thank you for your interest. Our team will be in touch shortly."}

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
