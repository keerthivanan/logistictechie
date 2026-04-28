"""
CargoLink AI Agent — Streaming + LlamaIndex RAG + OpenAI
Bilingual (Arabic/English), streams responses token by token.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Any
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.marketplace import MarketplaceRequest, MarketplaceBid
from app.models.conversation import Conversation
from app.models.booking import Booking
from app.core.config import settings
from openai import AsyncOpenAI
import json

router = APIRouter()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# Progress messages shown to user while tools run
PROGRESS = {
    "get_my_requests":           {"en": "Fetching your freight requests...",    "ar": "جارٍ جلب طلبات الشحن..."},
    "get_quotes_for_request":    {"en": "Loading quotes...",                    "ar": "جارٍ تحميل عروض الأسعار..."},
    "get_my_conversations":      {"en": "Checking your negotiations...",        "ar": "جارٍ فحص المفاوضات..."},
    "get_my_bookings":           {"en": "Loading your bookings...",             "ar": "جارٍ تحميل الحجوزات..."},
    "get_dashboard_stats":       {"en": "Analyzing your account...",            "ar": "جارٍ تحليل حسابك..."},
    "get_request_details":       {"en": "Getting request details...",           "ar": "جارٍ جلب تفاصيل الطلب..."},
    "search_freight_knowledge":  {"en": "Searching freight knowledge base...", "ar": "جارٍ البحث في قاعدة المعرفة..."},
    "compare_and_recommend_quotes": {"en": "Comparing and analyzing quotes...", "ar": "جارٍ مقارنة عروض الأسعار..."},
    "get_all_my_data":           {"en": "Loading your full account overview...", "ar": "جارٍ تحميل نظرة عامة على حسابك..."},
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_my_requests",
            "description": "Get all freight requests submitted by the user with status and quote counts",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_quotes_for_request",
            "description": "Get all quotes/bids for a specific freight request",
            "parameters": {
                "type": "object",
                "properties": {"request_id": {"type": "string"}},
                "required": ["request_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_conversations",
            "description": "Get all active negotiation conversations",
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
            "description": "Get summary: total requests, active shipments, bookings, conversations",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_request_details",
            "description": "Get full details of a specific request including all quotes",
            "parameters": {
                "type": "object",
                "properties": {"request_id": {"type": "string"}},
                "required": ["request_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_freight_knowledge",
            "description": "Search the freight knowledge base for questions about incoterms, HS codes, customs rules, shipping terms, trade regulations, container types, documentation, Middle East trade, pricing benchmarks.",
            "parameters": {
                "type": "object",
                "properties": {"question": {"type": "string"}},
                "required": ["question"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_and_recommend_quotes",
            "description": "Analyze and compare all quotes for a request and give a recommendation",
            "parameters": {
                "type": "object",
                "properties": {"request_id": {"type": "string"}},
                "required": ["request_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_my_data",
            "description": "Get complete overview of everything — requests, quotes, conversations, bookings",
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
        req_check = await db.execute(
            select(MarketplaceRequest).where(
                MarketplaceRequest.request_id == args["request_id"],
                MarketplaceRequest.user_sovereign_id == sid,
            )
        )
        if not req_check.scalars().first():
            return {"error": "Request not found"}
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
        req_count = await db.scalar(select(func.count()).where(MarketplaceRequest.user_sovereign_id == sid))
        open_count = await db.scalar(select(func.count()).where(MarketplaceRequest.user_sovereign_id == sid, MarketplaceRequest.status == "OPEN"))
        booked_count = await db.scalar(select(func.count()).where(Booking.user_sovereign_id == sid))
        conv_count = await db.scalar(select(func.count()).where(Conversation.shipper_id == sid))
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
        bids_res = await db.execute(select(MarketplaceBid).where(MarketplaceBid.request_id == r.request_id))
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

    if name == "search_freight_knowledge":
        try:
            from app.services.rag_service import query_knowledge
            return query_knowledge(args["question"])
        except Exception as e:
            return f"Knowledge search error: {e}"

    if name == "compare_and_recommend_quotes":
        res = await db.execute(
            select(MarketplaceRequest).where(
                MarketplaceRequest.request_id == args["request_id"],
                MarketplaceRequest.user_sovereign_id == sid
            )
        )
        r = res.scalars().first()
        if not r:
            return {"error": "Request not found"}
        bids_res = await db.execute(select(MarketplaceBid).where(MarketplaceBid.request_id == r.request_id))
        bids = bids_res.scalars().all()
        if not bids:
            return {"message": "No quotes yet for this request"}
        quotes = sorted(
            [{"forwarder": b.forwarder_company, "price": float(b.total_price) if b.total_price else 0,
              "currency": b.currency, "transit_days": b.transit_days, "carrier": b.carrier} for b in bids],
            key=lambda x: x["price"]
        )
        return {
            "request": f"{r.origin} → {r.destination} ({r.cargo_type})",
            "total_quotes": len(quotes),
            "cheapest": quotes[0],
            "fastest": min(quotes, key=lambda x: x["transit_days"] or 999),
            "all_quotes_sorted_by_price": quotes,
        }

    if name == "get_all_my_data":
        requests = await run_tool("get_my_requests", {}, user, db)
        stats = await run_tool("get_dashboard_stats", {}, user, db)
        bookings = await run_tool("get_my_bookings", {}, user, db)
        conversations = await run_tool("get_my_conversations", {}, user, db)
        return {"stats": stats, "requests": requests, "bookings": bookings, "conversations": conversations}

    return {"error": f"Unknown tool: {name}"}


def _is_arabic(text: str) -> bool:
    arabic_chars = sum(1 for c in text if '؀' <= c <= 'ۿ')
    return arabic_chars / max(len(text), 1) > 0.2


def _build_system_prompt(user: User) -> str:
    first_name = (user.full_name or "").split()[0] if user.full_name else "there"
    return f"""You are CargoLink AI — a bilingual freight logistics assistant for CargoLink, a marketplace connecting shippers with freight forwarders in the Middle East and globally.

You are helping: {first_name} (Account: {user.sovereign_id})

LANGUAGE (critical):
- Detect language from the user's message
- Arabic message → respond FULLY in Arabic (العربية)
- English message → respond in English
- Never mix languages

FORMATTING:
- Use **bold** for prices, company names, key numbers
- Use bullet points (- ) for lists
- Keep it concise — no long paragraphs

KNOWLEDGE:
1. LIVE DATA — use DB tools for real-time account data
2. FREIGHT KNOWLEDGE — use search_freight_knowledge for incoterms, HS codes, customs, shipping terms, Middle East trade, pricing

RULES:
- Always fetch live data before answering account questions
- Give specific numbers and names — no vague answers
- For quotes: compare **price** AND **transit days**, give a clear recommendation"""


class AgentMessage(BaseModel):
    message: str
    history: list = []


@router.post("/chat/stream")
async def agent_chat_stream(
    body: AgentMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Streaming endpoint — sends SSE events: progress, token, done, error."""
    lang = "ar" if _is_arabic(body.message) else "en"
    system_prompt = _build_system_prompt(current_user)

    messages = [{"role": "system", "content": system_prompt}]
    for h in body.history[-6:]:
        messages.append(h)
    messages.append({"role": "user", "content": body.message})

    async def generate():
        try:
            for _ in range(6):
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
                        # Send progress event so UI shows what's happening
                        prog = PROGRESS.get(tc.function.name, {}).get(lang, "Working...")
                        yield f"data: {json.dumps({'progress': prog})}\n\n"

                        args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                        result = await run_tool(tc.function.name, args, current_user, db)
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": json.dumps(result, default=str),
                        })
                else:
                    # No more tool calls — stream the final answer token by token
                    stream = await client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages,
                        stream=True,
                    )
                    async for chunk in stream:
                        token = chunk.choices[0].delta.content or ""
                        if token:
                            yield f"data: {json.dumps({'token': token})}\n\n"
                    yield "data: [DONE]\n\n"
                    return

            yield "data: [DONE]\n\n"

        except Exception as e:
            err = "حدث خطأ. حاول مرة أخرى." if lang == "ar" else "Something went wrong. Please try again."
            yield f"data: {json.dumps({'error': err})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
