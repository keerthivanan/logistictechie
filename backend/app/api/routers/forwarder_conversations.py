"""
Forwarder Portal Conversation Endpoints
========================================
Portal-auth variants of /api/conversations/* for forwarders who use
email + partner_id auth (no JWT). Mirrors the JWT-protected endpoints
but validates identity via Forwarder.email + Forwarder.forwarder_id.

Auth model: same as /api/forwarders/portal-bid — forwarder_id + email
checked against the forwarders table, status must be ACTIVE.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.db.session import get_db
from app.models.conversation import Conversation, ChatMessage
from app.models.forwarder import Forwarder
from app.models.marketplace import MarketplaceRequest
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class PortalAuth(BaseModel):
    forwarder_id: str
    email: str


class PortalMessageIn(BaseModel):
    forwarder_id: str
    email: str
    content: str = Field(..., min_length=1, max_length=2000)


class PortalRespondIn(BaseModel):
    forwarder_id: str
    email: str
    action: str  # ACCEPT | REJECT


class PortalCloseIn(BaseModel):
    forwarder_id: str
    email: str


# ─── Auth Helper ──────────────────────────────────────────────────────────────

async def _verify_portal_forwarder(
    forwarder_id: str,
    email: str,
    public_id: str,
    db: AsyncSession,
) -> tuple:
    """
    Validates portal credentials and conversation ownership.
    Returns (forwarder, conversation).
    """
    fwd_res = await db.execute(
        select(Forwarder).where(
            Forwarder.forwarder_id == forwarder_id,
            Forwarder.email == email,
            Forwarder.status == "ACTIVE",
        )
    )
    fwd = fwd_res.scalars().first()
    if not fwd:
        raise HTTPException(status_code=401, detail="Invalid portal credentials.")

    conv_res = await db.execute(
        select(Conversation).where(Conversation.public_id == public_id)
    )
    conv = conv_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if conv.forwarder_id != forwarder_id:
        raise HTTPException(status_code=403, detail="You are not a party to this conversation.")

    return fwd, conv


# ─── Serializers ──────────────────────────────────────────────────────────────

def _msg_dict(m: ChatMessage) -> dict:
    return {
        "id": m.id,
        "sender_role": m.sender_role,
        "sender_id": m.sender_id,
        "message_type": m.message_type,
        "content": m.content,
        "offer_amount": float(m.offer_amount) if m.offer_amount is not None else None,
        "created_at": m.created_at,
    }


def _conv_dict(c: Conversation, last_message: Optional[ChatMessage] = None) -> dict:
    return {
        "public_id": c.public_id,
        "request_id": c.request_id,
        "forwarder_company": c.forwarder_company,
        "original_price": float(c.original_price) if c.original_price is not None else None,
        "current_offer": float(c.current_offer) if c.current_offer is not None else None,
        "agreed_price": float(c.agreed_price) if c.agreed_price is not None else None,
        "currency": c.currency,
        "status": c.status,
        "booking_id": c.booking_id,
        "shipper_close_req": c.shipper_close_req,
        "forwarder_close_req": c.forwarder_close_req,
        "created_at": c.created_at,
        "last_message": _msg_dict(last_message) if last_message else None,
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/list")
async def list_portal_conversations(
    forwarder_id: str = Query(...),
    email: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    List all conversations for this forwarder. Used for the portal Conversations tab.
    """
    # Validate credentials (no public_id needed for list)
    fwd_res = await db.execute(
        select(Forwarder).where(
            Forwarder.forwarder_id == forwarder_id,
            Forwarder.email == email,
            Forwarder.status == "ACTIVE",
        )
    )
    if not fwd_res.scalars().first():
        raise HTTPException(status_code=401, detail="Invalid portal credentials.")

    convs_res = await db.execute(
        select(Conversation)
        .where(Conversation.forwarder_id == forwarder_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = convs_res.scalars().all()

    result = []
    for conv in conversations:
        last_msg_res = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_res.scalars().first()

        # Count unread (messages not sent by forwarder, not yet read)
        unread_res = await db.execute(
            select(func.count(ChatMessage.id)).where(
                ChatMessage.conversation_id == conv.id,
                ChatMessage.sender_id != forwarder_id,
                ChatMessage.is_read == False,  # noqa: E712
                ChatMessage.sender_role != "SYSTEM",
            )
        )
        unread_count = unread_res.scalar() or 0

        entry = _conv_dict(conv, last_msg)
        entry["unread_count"] = unread_count
        result.append(entry)

    return {"conversations": result}


@router.get("/{public_id}/messages")
async def get_portal_messages(
    public_id: str,
    forwarder_id: str = Query(...),
    email: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Poll all messages for a conversation (forwarder portal).
    Also marks messages sent by shipper as read.
    """
    _, conv = await _verify_portal_forwarder(forwarder_id, email, public_id, db)

    msgs_res = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = msgs_res.scalars().all()

    # Mark incoming messages (not from forwarder, not SYSTEM) as read
    unread_ids = [
        m.id for m in messages
        if m.sender_id != forwarder_id and not m.is_read and m.sender_role != "SYSTEM"
    ]
    if unread_ids:
        await db.execute(
            update(ChatMessage)
            .where(ChatMessage.id.in_(unread_ids))
            .values(is_read=True)
        )
        await db.commit()

    return {
        "conversation": _conv_dict(conv),
        "messages": [_msg_dict(m) for m in messages],
    }


@router.post("/{public_id}/messages")
async def send_portal_message(
    public_id: str,
    data: PortalMessageIn,
    db: AsyncSession = Depends(get_db),
):
    """Send a plain TEXT message as forwarder (portal auth)."""
    _, conv = await _verify_portal_forwarder(data.forwarder_id, data.email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="FORWARDER",
        sender_id=data.forwarder_id,
        message_type="TEXT",
        content=data.content,
        is_read=False,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/respond-offer")
async def portal_respond_offer(
    public_id: str,
    data: PortalRespondIn,
    db: AsyncSession = Depends(get_db),
):
    """Forwarder (portal auth) accepts or rejects a shipper counter-offer."""
    _, conv = await _verify_portal_forwarder(data.forwarder_id, data.email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")
    if conv.current_offer is None:
        raise HTTPException(status_code=409, detail="No active offer to respond to.")

    action = data.action.upper()
    if action not in ("ACCEPT", "REJECT"):
        raise HTTPException(status_code=422, detail="Action must be ACCEPT or REJECT.")

    if action == "ACCEPT":
        conv.agreed_price = conv.current_offer
        msg_content = f"Offer accepted — agreed price: {conv.currency} {float(conv.current_offer):,.2f}"
        msg_type = "ACCEPTED"
    else:
        msg_content = f"Offer rejected. Original price stands: {conv.currency} {float(conv.original_price):,.2f}"
        msg_type = "REJECTED"
        conv.current_offer = None

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="FORWARDER",
        sender_id=data.forwarder_id,
        message_type=msg_type,
        content=msg_content,
        is_read=False,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/close")
async def portal_close_deal(
    public_id: str,
    data: PortalCloseIn,
    db: AsyncSession = Depends(get_db),
):
    """
    Forwarder (portal auth) requests to close the deal.
    If shipper has already requested close → both confirmed → conversation + request CLOSED.
    """
    _, conv = await _verify_portal_forwarder(data.forwarder_id, data.email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is already closed.")
    if conv.forwarder_close_req:
        raise HTTPException(status_code=409, detail="You have already requested to close this deal.")

    conv.forwarder_close_req = True

    if conv.shipper_close_req:
        # Both confirmed — close everything
        conv.status = "CLOSED"

        system_msg = ChatMessage(
            conversation_id=conv.id,
            sender_role="SYSTEM", sender_id="SYSTEM", message_type="SYSTEM",
            content="✅ Deal closed by both parties. This conversation is now archived.",
            is_read=False,
        )
        db.add(system_msg)

        # Close the marketplace request
        req_res = await db.execute(
            select(MarketplaceRequest).where(MarketplaceRequest.request_id == conv.request_id)
        )
        req = req_res.scalars().first()
        if req and req.status != "CLOSED":
            req.status = "CLOSED"

        # Cascade close all other OPEN conversations for this request
        other_convs_res = await db.execute(
            select(Conversation).where(
                Conversation.request_id == conv.request_id,
                Conversation.id != conv.id,
                Conversation.status == "OPEN",
            )
        )
        for other_conv in other_convs_res.scalars().all():
            other_conv.status = "CLOSED"
            db.add(ChatMessage(
                conversation_id=other_conv.id,
                sender_role="SYSTEM", sender_id="SYSTEM", message_type="SYSTEM",
                content="This request has been fulfilled through another conversation. No further action required.",
                is_read=False,
            ))

        await db.commit()
        return {"status": "CLOSED", "message": "Deal closed. Both parties confirmed."}
    else:
        system_msg = ChatMessage(
            conversation_id=conv.id,
            sender_role="SYSTEM", sender_id="SYSTEM", message_type="SYSTEM",
            content="Forwarder has marked this deal as closed. Waiting for shipper to confirm.",
            is_read=False,
        )
        db.add(system_msg)
        await db.commit()
        return {"status": "PENDING_CLOSE", "message": "Waiting for shipper to confirm closure."}
