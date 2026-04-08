"""
Forwarder Portal Conversation Endpoints
========================================
Portal-auth variants of /api/conversations/* for forwarders who use
email + partner_id auth (no JWT). Mirrors the JWT-protected endpoints
but validates identity via Forwarder.email + Forwarder.forwarder_id.

Auth model: same as /api/forwarders/portal-bid — forwarder_id + email
checked against the forwarders table, status must be ACTIVE.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.db.session import get_db
from app.models.conversation import Conversation, ChatMessage
from app.models.forwarder import Forwarder
from app.models.marketplace import MarketplaceRequest
from app.models.user import User
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class PortalMessageIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class PortalRespondIn(BaseModel):
    action: str  # ACCEPT | REJECT | COUNTER
    counter_amount: Optional[float] = None


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
        "quote_id": c.quote_id,
        "booking_id": c.booking_id,
        "offer_side": c.offer_side,
        "shipper_close_req": c.shipper_close_req,
        "forwarder_close_req": c.forwarder_close_req,
        "shipper_book_req": c.shipper_book_req,
        "forwarder_book_req": c.forwarder_book_req,
        "shipper_last_seen": c.shipper_last_seen.isoformat() if c.shipper_last_seen else None,
        "forwarder_last_seen": c.forwarder_last_seen.isoformat() if c.forwarder_last_seen else None,
        "created_at": c.created_at,
        "last_message": _msg_dict(last_message) if last_message else None,
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/list")
async def list_portal_conversations(
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all conversations for this forwarder. Used for the portal Conversations tab.
    """
    # Validate credentials (no public_id needed for list)
    fwd_res = await db.execute(
        select(Forwarder).where(
            Forwarder.forwarder_id == x_forwarder_id,
            Forwarder.email == x_forwarder_email,
            Forwarder.status == "ACTIVE",
        )
    )
    if not fwd_res.scalars().first():
        raise HTTPException(status_code=401, detail="Invalid portal credentials.")

    convs_res = await db.execute(
        select(Conversation)
        .where(Conversation.forwarder_id == x_forwarder_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = convs_res.scalars().all()

    if not conversations:
        return {"conversations": []}

    conv_ids = [c.id for c in conversations]

    # Batch: latest message per conversation
    max_id_rows = await db.execute(
        select(ChatMessage.conversation_id, func.max(ChatMessage.id).label("max_id"))
        .where(ChatMessage.conversation_id.in_(conv_ids))
        .group_by(ChatMessage.conversation_id)
    )
    max_ids = [r.max_id for r in max_id_rows.all()]
    last_msg_map: dict = {}
    if max_ids:
        lm_res = await db.execute(select(ChatMessage).where(ChatMessage.id.in_(max_ids)))
        for m in lm_res.scalars().all():
            last_msg_map[m.conversation_id] = m

    # Batch: unread counts per conversation
    unread_rows = await db.execute(
        select(ChatMessage.conversation_id, func.count(ChatMessage.id).label("cnt"))
        .where(
            ChatMessage.conversation_id.in_(conv_ids),
            ChatMessage.sender_id != x_forwarder_id,
            ChatMessage.is_read == False,  # noqa: E712
            ChatMessage.sender_role != "SYSTEM",
        )
        .group_by(ChatMessage.conversation_id)
    )
    unread_map = {r.conversation_id: r.cnt for r in unread_rows.all()}

    result = []
    for conv in conversations:
        entry = _conv_dict(conv, last_msg_map.get(conv.id))
        entry["unread_count"] = unread_map.get(conv.id, 0)
        result.append(entry)

    return {"conversations": result}


@router.get("/{public_id}/messages")
async def get_portal_messages(
    public_id: str,
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """
    Poll all messages for a conversation (forwarder portal).
    Also marks messages sent by shipper as read.
    """
    _, conv = await _verify_portal_forwarder(x_forwarder_id, x_forwarder_email, public_id, db)

    msgs_res = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = msgs_res.scalars().all()

    # Update forwarder last_seen on every poll
    conv.forwarder_last_seen = _utcnow()

    # Mark incoming messages (not from forwarder, not SYSTEM) as read
    unread_ids = [
        m.id for m in messages
        if m.sender_id != x_forwarder_id and not m.is_read and m.sender_role != "SYSTEM"
    ]
    if unread_ids:
        await db.execute(
            update(ChatMessage)
            .where(ChatMessage.id.in_(unread_ids))
            .values(is_read=True)
        )

    await db.commit()
    await db.refresh(conv)

    return {
        "conversation": _conv_dict(conv),
        "messages": [_msg_dict(m) for m in messages],
    }


@router.post("/{public_id}/messages")
async def send_portal_message(
    public_id: str,
    data: PortalMessageIn,
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """Send a plain TEXT message as forwarder (portal auth)."""
    _, conv = await _verify_portal_forwarder(x_forwarder_id, x_forwarder_email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="FORWARDER",
        sender_id=x_forwarder_id,
        message_type="TEXT",
        content=data.content,
        is_read=False,
    )
    conv.updated_at = _utcnow()
    conv.forwarder_last_seen = _utcnow()
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/respond-offer")
async def portal_respond_offer(
    public_id: str,
    data: PortalRespondIn,
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """Forwarder (portal auth) accepts or rejects a shipper counter-offer."""
    _, conv = await _verify_portal_forwarder(x_forwarder_id, x_forwarder_email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")
    if conv.offer_side != "SHIPPER":
        raise HTTPException(status_code=409, detail="No shipper offer to respond to.")

    action = data.action.upper()
    if action not in ("ACCEPT", "REJECT", "COUNTER"):
        raise HTTPException(status_code=422, detail="Action must be ACCEPT, REJECT, or COUNTER.")

    if action == "ACCEPT":
        conv.agreed_price = conv.current_offer
        conv.current_offer = None
        conv.offer_side = None
        msg_content = f"Offer accepted — agreed price: {conv.currency} {float(conv.agreed_price):,.2f}"
        msg_type = "ACCEPTED"

    elif action == "REJECT":
        conv.current_offer = None
        conv.offer_side = None
        msg_content = f"Offer rejected. Original price stands: {conv.currency} {float(conv.original_price):,.2f}"
        msg_type = "REJECTED"

    else:  # COUNTER
        if not data.counter_amount:
            raise HTTPException(status_code=422, detail="counter_amount is required for COUNTER action.")
        shipper_offer = float(conv.current_offer)
        original = float(conv.original_price)
        if data.counter_amount <= shipper_offer:
            raise HTTPException(status_code=422, detail=f"Counter must be higher than the shipper's offer ({conv.currency} {shipper_offer:,.2f}).")
        if data.counter_amount >= original:
            raise HTTPException(status_code=422, detail=f"Counter must be less than the original quoted price ({conv.currency} {original:,.2f}).")
        conv.current_offer = data.counter_amount
        conv.offer_side = "FORWARDER"
        msg_content = f"Counter offer: {conv.currency} {data.counter_amount:,.2f}"
        msg_type = "COUNTER_OFFER"

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="FORWARDER",
        sender_id=x_forwarder_id,
        message_type=msg_type,
        content=msg_content,
        offer_amount=data.counter_amount if msg_type == "COUNTER_OFFER" else None,
        is_read=False,
    )
    db.add(msg)
    conv.updated_at = _utcnow()
    conv.forwarder_last_seen = _utcnow()
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/close")
async def portal_close_deal(
    public_id: str,
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """
    Forwarder (portal auth) requests to close the deal.
    If shipper has already requested close → both confirmed → conversation + request CLOSED.
    """
    _, conv = await _verify_portal_forwarder(x_forwarder_id, x_forwarder_email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is already closed.")
    if conv.forwarder_close_req:
        raise HTTPException(status_code=409, detail="You have already requested to close this deal.")

    conv.forwarder_close_req = True
    conv.forwarder_last_seen = _utcnow()

    if conv.shipper_close_req:
        # Both confirmed — close this conversation, the request, and notify all others.
        conv.status = "CLOSED"

        db.add(ChatMessage(
            conversation_id=conv.id,
            sender_role="SYSTEM", sender_id="SYSTEM", message_type="SYSTEM",
            content="✅ Deal closed by both parties. This conversation is now archived.",
            is_read=False,
        ))

        # Close the marketplace request
        req_res = await db.execute(
            select(MarketplaceRequest).where(MarketplaceRequest.request_id == conv.request_id)
        )
        req = req_res.scalars().first()
        if req and req.status != "CLOSED":
            req.status = "CLOSED"

        # Notify all other open conversations for this request
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
                content="This request has been fulfilled. The shipper has closed a deal with another forwarder.",
                is_read=False,
            ))

        conv.updated_at = _utcnow()
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
        conv.updated_at = _utcnow()
        await db.commit()
        return {"status": "PENDING_CLOSE", "message": "Waiting for shipper to confirm closure."}


@router.post("/{public_id}/confirm-booking")
async def portal_confirm_booking(
    public_id: str,
    background_tasks: BackgroundTasks,
    x_forwarder_id: str = Header(..., alias="X-Forwarder-Id"),
    x_forwarder_email: str = Header(..., alias="X-Forwarder-Email"),
    db: AsyncSession = Depends(get_db),
):
    """
    Forwarder signals they want to confirm the booking.
    Booking is only created when BOTH shipper and forwarder have confirmed.
    Imports _finalize_booking from conversations router to share logic.
    """
    from app.api.routers.conversations import _finalize_booking

    _, conv = await _verify_portal_forwarder(x_forwarder_id, x_forwarder_email, public_id, db)

    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="Conversation is not open.")
    if conv.forwarder_book_req:
        raise HTTPException(status_code=409, detail="You already confirmed. Waiting for the shipper.")
    if conv.offer_side == "SHIPPER":
        raise HTTPException(status_code=409, detail="There is a pending offer from the shipper. Respond to it before confirming the booking.")
    if conv.current_offer is not None and conv.offer_side == "FORWARDER":
        raise HTTPException(status_code=409, detail="Your counter-offer is pending. Wait for the shipper to respond before confirming the booking.")

    conv.forwarder_book_req = True

    if conv.shipper_book_req:
        # Both confirmed — fetch shipper user and finalize booking
        shipper_res = await db.execute(
            select(User).where(User.sovereign_id == conv.shipper_id)
        )
        shipper = shipper_res.scalars().first()
        if not shipper:
            raise HTTPException(status_code=404, detail="Shipper account not found.")
        return await _finalize_booking(conv, db, shipper, background_tasks)

    # Only forwarder confirmed — wait for shipper
    db.add(ChatMessage(
        conversation_id=conv.id,
        sender_role="SYSTEM",
        sender_id="SYSTEM",
        message_type="SYSTEM",
        content="Forwarder confirmed — waiting for shipper to lock the deal.",
        is_read=False,
    ))
    conv.updated_at = _utcnow()
    await db.commit()
    return {"status": "PENDING_BOOKING", "message": "Waiting for shipper to confirm."}
