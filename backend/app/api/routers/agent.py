from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Any
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.conversation import Conversation, ChatMessage
from app.models.booking import Booking
from app.core.config import settings
from openai import AsyncOpenAI
import json

router = APIRouter()

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_my_requests",
            "description": "Get all freight requests submitted by the user with their status and quote counts",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_quotes_for_request",
            "description": "Get all quotes/bids received for a specific freight request",
            "parameters": {
                "type": "object",
                "properties": {
                    "request_id": {"type": "string", "description": "The request ID"}
                },
                "required": ["request_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_conversations",
            "description": "Get all active negotiation conversations the user has",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_bookings",
            "description": "Get all confirmed bookings for the user",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_dashboard_stats",
            "description": "Get summary stats: total requests, active shipments, unread messages, pending tasks",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_request_details",
            "description": "Get full details of a specific freight request including all quotes",
            "parameters": {
                "type": "object",
                "properties": {
                    "request_id": {"type": "string", "description": "The request ID"}
                },
                "required": ["request_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_conversation_messages",
            "description": "Get the message history and negotiation state of a conversation",
            "parameters": {
                "type": "object",
                "properties": {
                    "public_id": {"type": "string", "description": "The conversation public ID"}
                },
                "required": ["public_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_my_data",
            "description": "Get a complete overview of everything — requests, quotes, conversations, bookings",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]


async def run_tool(name: str, args: dict, user: User, db: AsyncSession) -> Any:
    sid = user.sovereign_id

    if name == "get_my_requests":
        res = await db.execute(
            select(MarketplaceRequest)
            .where(MarketplaceRequest.user_sovereign_id == sid)
            .order_by(MarketplaceRequest.submitted_at.desc())
        )
        reqs = res.scalars().all()
        return [
            {
                "request_id": r.request_id,
                "origin": r.origin,
                "destination": r.destination,
                "cargo_type": r.cargo_type,
                "commodity": r.commodity,
                "container_type": r.container_type,
                "status": r.status,
                "quote_count": r.quotation_count or 0,
                "submitted_at": str(r.submitted_at),
            }
            for r in reqs
        ]

    if name == "get_quotes_for_request":
        res = await db.execute(
            select(MarketplaceBid).where(MarketplaceBid.request_id == args["request_id"])
        )
        bids = res.scalars().all()
        return [
            {
                "quotation_id": b.quotation_id,
                "forwarder_company": b.forwarder_company,
                "total_price": float(b.total_price) if b.total_price else None,
                "currency": b.currency,
                "transit_days": b.transit_days,
                "carrier": b.carrier,
                "status": b.status,
            }
            for b in bids
        ]

    if name == "get_my_conversations":
        res = await db.execute(
            select(Conversation)
            .where(Conversation.shipper_id == sid)
            .order_by(Conversation.updated_at.desc())
        )
        convs = res.scalars().all()
        return [
            {
                "public_id": c.public_id,
                "forwarder_company": c.forwarder_company,
                "status": c.status,
                "current_offer": float(c.current_offer) if c.current_offer else None,
                "agreed_price": float(c.agreed_price) if c.agreed_price else None,
                "offer_side": c.offer_side,
                "currency": c.currency,
            }
            for c in convs
        ]

    if name == "get_my_bookings":
        res = await db.execute(
            select(Booking)
            .where(Booking.user_sovereign_id == sid)
            .order_by(Booking.created_at.desc())
        )
        bookings = res.scalars().all()
        return [
            {
                "reference": b.reference,
                "carrier_name": b.carrier_name,
                "origin": b.origin_locode,
                "destination": b.destination_locode,
                "total_price": float(b.total_price),
                "currency": b.currency,
                "transit_days": b.transit_days,
                "status": b.status,
                "confirmed_at": str(b.confirmed_at),
            }
            for b in bookings
        ]

    if name == "get_dashboard_stats":
        req_count = await db.scalar(
            select(func.count()).where(MarketplaceRequest.user_sovereign_id == sid)
        )
        open_count = await db.scalar(
            select(func.count()).where(
                MarketplaceRequest.user_sovereign_id == sid,
                MarketplaceRequest.status == "OPEN"
            )
        )
        booked_count = await db.scalar(
            select(func.count()).where(Booking.user_sovereign_id == sid)
        )
        conv_count = await db.scalar(
            select(func.count()).where(Conversation.shipper_id == sid)
        )
        return {
            "total_requests": req_count,
            "open_requests": open_count,
            "total_bookings": booked_count,
            "total_conversations": conv_count,
        }

    if name == "get_request_details":
        res = await db.execute(
            select(MarketplaceRequest).where(
                MarketplaceRequest.request_id == args["request_id"],
                MarketplaceRequest.user_sovereign_id == sid
            )
        )
        r = res.scalars().first()
        if not r:
            return {"error": "Request not found"}
        bids_res = await db.execute(
            select(MarketplaceBid).where(MarketplaceBid.request_id == r.request_id)
        )
        bids = bids_res.scalars().all()
        return {
            "request_id": r.request_id,
            "origin": r.origin,
            "destination": r.destination,
            "cargo_type": r.cargo_type,
            "commodity": r.commodity,
            "status": r.status,
            "submitted_at": str(r.submitted_at),
            "quotes": [
                {
                    "forwarder": b.forwarder_company,
                    "price": float(b.total_price) if b.total_price else None,
                    "currency": b.currency,
                    "transit_days": b.transit_days,
                    "carrier": b.carrier,
                }
                for b in bids
            ],
        }

    if name == "get_conversation_messages":
        res = await db.execute(
            select(Conversation).where(
                Conversation.public_id == args["public_id"],
                Conversation.shipper_id == sid
            )
        )
        conv = res.scalars().first()
        if not conv:
            return {"error": "Conversation not found"}
        msgs_res = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.asc())
            .limit(20)
        )
        msgs = msgs_res.scalars().all()
        return {
            "status": conv.status,
            "forwarder_company": conv.forwarder_company,
            "original_price": float(conv.original_price) if conv.original_price else None,
            "current_offer": float(conv.current_offer) if conv.current_offer else None,
            "agreed_price": float(conv.agreed_price) if conv.agreed_price else None,
            "offer_side": conv.offer_side,
            "messages": [
                {
                    "sender": m.sender_role,
                    "type": m.message_type,
                    "content": m.content,
                    "amount": float(m.offer_amount) if m.offer_amount else None,
                }
                for m in msgs
            ],
        }

    if name == "get_all_my_data":
        requests = await run_tool("get_my_requests", {}, user, db)
        stats = await run_tool("get_dashboard_stats", {}, user, db)
        bookings = await run_tool("get_my_bookings", {}, user, db)
        conversations = await run_tool("get_my_conversations", {}, user, db)
        return {
            "stats": stats,
            "requests": requests,
            "bookings": bookings,
            "conversations": conversations,
        }

    return {"error": f"Unknown tool: {name}"}


class AgentMessage(BaseModel):
    message: str
    history: list = []


@router.post("/chat")
async def agent_chat(
    body: AgentMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    system_prompt = f"""You are a smart freight logistics assistant for CargoLink — a marketplace connecting shippers with freight forwarders.

You are helping: {current_user.full_name} (ID: {current_user.sovereign_id})

Your job:
- Answer questions about their freight requests, quotes, bookings, negotiations
- Use the tools to fetch real live data before answering
- Be concise, friendly and specific — always use actual numbers/names from the data
- If they ask something you can't help with, say so briefly
- Don't make up data — always fetch it first"""

    messages = [{"role": "system", "content": system_prompt}]
    for h in body.history[-6:]:
        messages.append(h)
    messages.append({"role": "user", "content": body.message})

    # Agentic loop — let GPT call tools until it's done
    for _ in range(5):
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        msg = response.choices[0].message

        if msg.tool_calls:
            messages.append(msg)
            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                result = await run_tool(tc.function.name, args, current_user, db)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result),
                })
        else:
            return {"reply": msg.content}

    return {"reply": "Sorry, I couldn't process that. Please try again."}
