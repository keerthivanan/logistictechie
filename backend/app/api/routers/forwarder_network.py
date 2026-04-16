"""
Forwarder-to-Forwarder (F2F) Network
=====================================
Completely separate from the shipper marketplace. Forwarders post freight
requests, other forwarders quote, the poster accepts one quote, and they
negotiate in a private F2F chat thread.

Auth: X-Forwarder-Id + X-Forwarder-Email headers (same as portal).
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.forwarder import Forwarder
from app.models.forwarder_network import F2FRequest, F2FQuote, F2FConversation, F2FMessage
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from app.services.webhook import webhook_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


# ─── Auth dependency (mirrors portal auth in forwarders.py) ─────────────────

async def _verify_fwd(
    x_forwarder_id: Optional[str] = Header(None, alias="X-Forwarder-Id"),
    x_forwarder_email: Optional[str] = Header(None, alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
) -> Forwarder:
    if not x_forwarder_id or not x_forwarder_email:
        raise HTTPException(status_code=401, detail="Missing portal credentials.")
    res = await db.execute(select(Forwarder).where(Forwarder.forwarder_id == x_forwarder_id))
    f = res.scalars().first()
    if not f or f.email.lower() != x_forwarder_email.lower() or f.status != "ACTIVE":
        raise HTTPException(status_code=401, detail="Invalid portal credentials.")
    return f


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ─── Pydantic schemas ────────────────────────────────────────────────────────

class PostRequestIn(BaseModel):
    origin: str = Field(..., min_length=2, max_length=200)
    destination: str = Field(..., min_length=2, max_length=200)
    cargo_type: str = Field(..., pattern="^(FCL|LCL|AIR|ROAD)$")
    commodity: Optional[str] = None
    weight_kg: Optional[float] = None
    container_type: Optional[str] = None
    incoterms: Optional[str] = None
    currency: str = "USD"
    notes: Optional[str] = None

class SubmitQuoteIn(BaseModel):
    price: float = Field(..., gt=0)
    currency: str = "USD"
    transit_days: Optional[int] = None
    notes: Optional[str] = None

class SendMessageIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


# ─── POST /requests ──────────────────────────────────────────────────────────

@router.post("/requests")
async def post_f2f_request(
    body: PostRequestIn,
    bg: BackgroundTasks,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    req = F2FRequest(
        posted_by_id=fwd.forwarder_id,
        posted_by_company=fwd.company_name,
        origin=body.origin,
        destination=body.destination,
        cargo_type=body.cargo_type,
        commodity=body.commodity,
        weight_kg=body.weight_kg,
        container_type=body.container_type,
        incoterms=body.incoterms,
        currency=body.currency,
        notes=body.notes,
    )
    db.add(req)
    await db.flush()   # get req.id + req.public_id

    # Fetch all other ACTIVE forwarder emails to pass to n8n for broadcast
    all_fwds_res = await db.execute(
        select(Forwarder.email, Forwarder.company_name)
        .where(Forwarder.status == "ACTIVE", Forwarder.forwarder_id != fwd.forwarder_id)
    )
    recipients = [{"email": r.email, "company": r.company_name} for r in all_fwds_res.all()]

    await db.commit()
    await db.refresh(req)

    # Fire n8n broadcast in background
    bg.add_task(
        webhook_service.trigger_f2f_broadcast,
        {
            "request_public_id": req.public_id,
            "posted_by_company": fwd.company_name,
            "origin": req.origin,
            "destination": req.destination,
            "cargo_type": req.cargo_type,
            "commodity": req.commodity or "",
            "weight_kg": float(req.weight_kg) if req.weight_kg else None,
            "container_type": req.container_type or "",
            "notes": req.notes or "",
            "recipients": recipients,
        }
    )

    return {"success": True, "public_id": req.public_id}


# ─── GET /requests (browse — excluding own) ──────────────────────────────────

@router.get("/requests")
async def browse_f2f_requests(
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 30,
):
    res = await db.execute(
        select(F2FRequest)
        .where(F2FRequest.status == "OPEN", F2FRequest.posted_by_id != fwd.forwarder_id)
        .order_by(F2FRequest.created_at.desc())
        .offset(skip).limit(limit)
    )
    reqs = res.scalars().all()

    # Check which ones I've already quoted on
    if reqs:
        public_ids = [r.public_id for r in reqs]
        ids = [r.id for r in reqs]
        my_quotes_res = await db.execute(
            select(F2FQuote.request_id)
            .where(F2FQuote.request_id.in_(ids), F2FQuote.forwarder_id == fwd.forwarder_id)
        )
        already_quoted = {row[0] for row in my_quotes_res.all()}
    else:
        already_quoted = set()

    return {
        "requests": [
            {
                "public_id": r.public_id,
                "posted_by_company": r.posted_by_company,
                "origin": r.origin,
                "destination": r.destination,
                "cargo_type": r.cargo_type,
                "commodity": r.commodity,
                "weight_kg": float(r.weight_kg) if r.weight_kg else None,
                "container_type": r.container_type,
                "incoterms": r.incoterms,
                "currency": r.currency,
                "notes": r.notes,
                "quote_count": r.quote_count,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "already_quoted": r.id in already_quoted,
            }
            for r in reqs
        ]
    }


# ─── GET /my-requests ────────────────────────────────────────────────────────

@router.get("/my-requests")
async def my_f2f_requests(
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(F2FRequest)
        .where(F2FRequest.posted_by_id == fwd.forwarder_id)
        .order_by(F2FRequest.created_at.desc())
        .limit(50)
    )
    reqs = res.scalars().all()

    # Batch: quotes per request
    if reqs:
        req_ids = [r.id for r in reqs]
        quotes_res = await db.execute(
            select(F2FQuote).where(F2FQuote.request_id.in_(req_ids))
            .order_by(F2FQuote.created_at.asc())
        )
        quotes_by_req: dict = {}
        for q in quotes_res.scalars().all():
            quotes_by_req.setdefault(q.request_id, []).append(q)
    else:
        quotes_by_req = {}

    return {
        "requests": [
            {
                "public_id": r.public_id,
                "origin": r.origin,
                "destination": r.destination,
                "cargo_type": r.cargo_type,
                "commodity": r.commodity,
                "weight_kg": float(r.weight_kg) if r.weight_kg else None,
                "container_type": r.container_type,
                "currency": r.currency,
                "notes": r.notes,
                "status": r.status,
                "quote_count": r.quote_count,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "quotes": [
                    {
                        "id": q.id,
                        "forwarder_id": q.forwarder_id,
                        "company_name": q.company_name,
                        "price": float(q.price),
                        "currency": q.currency,
                        "transit_days": q.transit_days,
                        "notes": q.notes,
                        "status": q.status,
                        "created_at": q.created_at.isoformat() if q.created_at else None,
                    }
                    for q in quotes_by_req.get(r.id, [])
                ],
            }
            for r in reqs
        ]
    }


# ─── POST /requests/{public_id}/quote ────────────────────────────────────────

@router.post("/requests/{public_id}/quote")
async def submit_f2f_quote(
    public_id: str,
    body: SubmitQuoteIn,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FRequest).where(F2FRequest.public_id == public_id))
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.posted_by_id == fwd.forwarder_id:
        raise HTTPException(status_code=400, detail="Cannot quote on your own request.")
    if req.status != "OPEN":
        raise HTTPException(status_code=400, detail="Request is no longer open.")

    # Dedup: one quote per forwarder per request
    existing = await db.execute(
        select(F2FQuote).where(F2FQuote.request_id == req.id, F2FQuote.forwarder_id == fwd.forwarder_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="You have already submitted a quote for this request.")

    quote = F2FQuote(
        request_id=req.id,
        request_public_id=req.public_id,
        forwarder_id=fwd.forwarder_id,
        company_name=fwd.company_name,
        price=body.price,
        currency=body.currency,
        transit_days=body.transit_days,
        notes=body.notes,
    )
    db.add(quote)
    req.quote_count = (req.quote_count or 0) + 1
    await db.commit()
    return {"success": True}


# ─── POST /requests/{public_id}/accept/{quote_id} ────────────────────────────

@router.post("/requests/{public_id}/accept/{quote_id}")
async def accept_f2f_quote(
    public_id: str,
    quote_id: int,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FRequest).where(F2FRequest.public_id == public_id))
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.posted_by_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Only the request poster can accept quotes.")
    if req.status != "OPEN":
        raise HTTPException(status_code=400, detail="Request is no longer open.")

    q_res = await db.execute(select(F2FQuote).where(F2FQuote.id == quote_id, F2FQuote.request_id == req.id))
    accepted_quote = q_res.scalars().first()
    if not accepted_quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    # Mark accepted quote, reject others
    all_quotes_res = await db.execute(select(F2FQuote).where(F2FQuote.request_id == req.id))
    for q in all_quotes_res.scalars().all():
        q.status = "ACCEPTED" if q.id == quote_id else "REJECTED"

    # Create F2F conversation
    conv = F2FConversation(
        request_id=req.id,
        request_public_id=req.public_id,
        requester_id=req.posted_by_id,
        quoter_id=accepted_quote.forwarder_id,
        requester_company=req.posted_by_company,
        quoter_company=accepted_quote.company_name,
        agreed_price=accepted_quote.price,
        currency=accepted_quote.currency,
    )
    db.add(conv)

    # System message
    req.status = "MATCHED"

    await db.flush()

    opening = F2FMessage(
        conversation_id=conv.id,
        sender_id="SYSTEM",
        sender_role="SYSTEM",
        content=f"{req.posted_by_company} accepted your quote of {accepted_quote.currency} {float(accepted_quote.price):,.0f}. Start coordinating!",
        is_read=False,
    )
    db.add(opening)
    await db.commit()
    await db.refresh(conv)

    return {"success": True, "conv_public_id": conv.public_id}


# ─── POST /requests/{public_id}/close ────────────────────────────────────────

@router.post("/requests/{public_id}/close")
async def close_f2f_request(
    public_id: str,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FRequest).where(F2FRequest.public_id == public_id))
    req = res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.posted_by_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Only the poster can close this request.")
    req.status = "CLOSED"
    await db.commit()
    return {"success": True}


# ─── GET /conversations ───────────────────────────────────────────────────────

@router.get("/conversations")
async def list_f2f_conversations(
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import or_
    res = await db.execute(
        select(F2FConversation)
        .where(or_(
            F2FConversation.requester_id == fwd.forwarder_id,
            F2FConversation.quoter_id == fwd.forwarder_id,
        ))
        .order_by(F2FConversation.updated_at.desc())
        .limit(50)
    )
    convs = res.scalars().all()
    if not convs:
        return {"conversations": []}

    conv_ids = [c.id for c in convs]
    my_id = fwd.forwarder_id

    # Batch: last message per conv
    from sqlalchemy import func
    subq = (
        select(F2FMessage.conversation_id, func.max(F2FMessage.id).label("max_id"))
        .where(F2FMessage.conversation_id.in_(conv_ids))
        .group_by(F2FMessage.conversation_id)
        .subquery()
    )
    last_msgs_res = await db.execute(
        select(F2FMessage).join(subq, F2FMessage.id == subq.c.max_id)
    )
    last_msgs = {m.conversation_id: m for m in last_msgs_res.scalars().all()}

    # Batch: unread counts (messages sent by the OTHER party that I haven't read)
    unread_rows = await db.execute(
        select(F2FMessage.conversation_id, func.count(F2FMessage.id))
        .where(
            F2FMessage.conversation_id.in_(conv_ids),
            F2FMessage.sender_id != my_id,
            F2FMessage.is_read == False,  # noqa: E712
        )
        .group_by(F2FMessage.conversation_id)
    )
    unread_map = {row[0]: row[1] for row in unread_rows.all()}

    return {
        "conversations": [
            {
                "public_id": c.public_id,
                "request_public_id": c.request_public_id,
                "my_role": "REQUESTER" if c.requester_id == my_id else "QUOTER",
                "other_company": c.quoter_company if c.requester_id == my_id else c.requester_company,
                "agreed_price": float(c.agreed_price) if c.agreed_price else None,
                "currency": c.currency,
                "status": c.status,
                "unread_count": unread_map.get(c.id, 0),
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                "last_message": {
                    "content": last_msgs[c.id].content,
                    "sender_role": last_msgs[c.id].sender_role,
                    "created_at": last_msgs[c.id].created_at.isoformat() if last_msgs[c.id].created_at else None,
                } if c.id in last_msgs else None,
            }
            for c in convs
        ]
    }


# ─── GET /conversations/{public_id}/messages ─────────────────────────────────

@router.get("/conversations/{public_id}/messages")
async def get_f2f_messages(
    public_id: str,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FConversation).where(F2FConversation.public_id == public_id))
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.requester_id != fwd.forwarder_id and conv.quoter_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    my_role = "REQUESTER" if conv.requester_id == fwd.forwarder_id else "QUOTER"

    # Fetch messages + mark the other party's messages as read + update my last_seen
    msgs_res = await db.execute(
        select(F2FMessage)
        .where(F2FMessage.conversation_id == conv.id)
        .order_by(F2FMessage.created_at.asc())
        .limit(500)
    )
    msgs = msgs_res.scalars().all()

    for m in msgs:
        if m.sender_id != fwd.forwarder_id and not m.is_read:
            m.is_read = True

    if my_role == "REQUESTER":
        conv.requester_last_seen = _now()
    else:
        conv.quoter_last_seen = _now()

    await db.commit()

    other_last_seen = conv.quoter_last_seen if my_role == "REQUESTER" else conv.requester_last_seen

    return {
        "conversation": {
            "public_id": conv.public_id,
            "request_public_id": conv.request_public_id,
            "my_role": my_role,
            "requester_company": conv.requester_company,
            "quoter_company": conv.quoter_company,
            "other_company": conv.quoter_company if my_role == "REQUESTER" else conv.requester_company,
            "agreed_price": float(conv.agreed_price) if conv.agreed_price else None,
            "currency": conv.currency,
            "status": conv.status,
            "requester_confirmed": conv.requester_confirmed,
            "quoter_confirmed": conv.quoter_confirmed,
            "other_last_seen": other_last_seen.isoformat() if other_last_seen else None,
        },
        "messages": [
            {
                "id": m.id,
                "sender_id": m.sender_id,
                "sender_role": m.sender_role,
                "content": m.content,
                "is_read": m.is_read,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in msgs
        ],
    }


# ─── POST /conversations/{public_id}/messages ────────────────────────────────

@router.post("/conversations/{public_id}/messages")
async def send_f2f_message(
    public_id: str,
    body: SendMessageIn,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FConversation).where(F2FConversation.public_id == public_id))
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.requester_id != fwd.forwarder_id and conv.quoter_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if conv.status == "CLOSED":
        raise HTTPException(status_code=400, detail="Conversation is closed.")

    my_role = "REQUESTER" if conv.requester_id == fwd.forwarder_id else "QUOTER"

    msg = F2FMessage(
        conversation_id=conv.id,
        sender_id=fwd.forwarder_id,
        sender_role=my_role,
        content=body.content.strip(),
    )
    db.add(msg)
    conv.updated_at = _now()
    await db.commit()
    await db.refresh(msg)

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_role": msg.sender_role,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


# ─── POST /conversations/{public_id}/confirm ─────────────────────────────────

@router.post("/conversations/{public_id}/confirm")
async def confirm_f2f_deal(
    public_id: str,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FConversation).where(F2FConversation.public_id == public_id))
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.requester_id != fwd.forwarder_id and conv.quoter_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    if conv.requester_id == fwd.forwarder_id:
        conv.requester_confirmed = True
    else:
        conv.quoter_confirmed = True

    if conv.requester_confirmed and conv.quoter_confirmed:
        conv.status = "CONFIRMED"
        system_msg = F2FMessage(
            conversation_id=conv.id,
            sender_id="SYSTEM",
            sender_role="SYSTEM",
            content="Both parties confirmed. Deal locked.",
        )
        db.add(system_msg)

    await db.commit()
    return {"success": True, "status": conv.status}


# ─── POST /conversations/{public_id}/close ───────────────────────────────────

@router.post("/conversations/{public_id}/close")
async def close_f2f_conversation(
    public_id: str,
    fwd: Forwarder = Depends(_verify_fwd),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(F2FConversation).where(F2FConversation.public_id == public_id))
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.requester_id != fwd.forwarder_id and conv.quoter_id != fwd.forwarder_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    conv.status = "CLOSED"
    await db.commit()
    return {"success": True}
