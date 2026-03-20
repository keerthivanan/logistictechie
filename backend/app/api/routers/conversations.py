from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, ChatMessage
from app.models.marketplace import MarketplaceBid, MarketplaceRequest
from app.models.booking import Booking
from app.services.webhook import webhook_service
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid
import secrets
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

MIN_OFFER_RATIO = 0.80  # Shipper can't offer less than 80% of original price


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ─── Input Schemas ────────────────────────────────────────────────────────────

class StartConversationIn(BaseModel):
    request_id: str
    quote_id: str

class SendMessageIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class SendOfferIn(BaseModel):
    offer_amount: float = Field(..., gt=0)

class RespondOfferIn(BaseModel):
    action: str  # "ACCEPT" or "REJECT"


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _get_conversation(public_id: str, db: AsyncSession) -> Conversation:
    res = await db.execute(select(Conversation).where(Conversation.public_id == public_id))
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv


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
        "quote_id": c.quote_id,
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

@router.post("/start")
async def start_conversation(
    data: StartConversationIn,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Shipper clicks 'Chat with Forwarder' on a quote.
    Creates a private conversation thread. Idempotent — returns existing if already started.
    """
    if current_user.role == "forwarder":
        raise HTTPException(status_code=403, detail="Forwarders cannot initiate conversations.")

    # 1. Verify shipper owns the request
    req_res = await db.execute(
        select(MarketplaceRequest).where(MarketplaceRequest.request_id == data.request_id)
    )
    req = req_res.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.user_sovereign_id != current_user.sovereign_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not own this request.")
    if req.status == "CLOSED":
        raise HTTPException(status_code=409, detail="This request is closed and no longer accepting conversations.")

    # 2. Fetch the quote
    quote_res = await db.execute(
        select(MarketplaceBid).where(MarketplaceBid.quotation_id == data.quote_id)
    )
    quote = quote_res.scalars().first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found.")

    # 3. Idempotency — return existing conversation if already started for this quote
    existing_res = await db.execute(
        select(Conversation).where(
            Conversation.request_id == data.request_id,
            Conversation.quote_id == data.quote_id,
        )
    )
    existing = existing_res.scalars().first()
    if existing:
        return {"public_id": existing.public_id, "existed": True}

    # 4. Create Conversation
    conv = Conversation(
        public_id=str(uuid.uuid4()),
        request_id=data.request_id,
        quote_id=data.quote_id,
        shipper_id=current_user.sovereign_id,
        forwarder_id=quote.forwarder_id,
        forwarder_company=quote.forwarder_company or "Forwarder",
        original_price=quote.total_price,
        currency=quote.currency or "USD",
    )
    db.add(conv)
    await db.flush()  # get conv.id before adding messages

    # 5. Opening SYSTEM message
    opening_text = (
        f"Chat started with {conv.forwarder_company}. "
        f"Quoted: {conv.currency} {float(conv.original_price):,.2f}. "
        f"You can negotiate the price. "
        f"Contact details are shared only after booking is confirmed."
    )
    opening_msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="SYSTEM",
        sender_id="SYSTEM",
        message_type="SYSTEM",
        content=opening_text,
        is_read=True,  # system messages are always "read"
    )
    db.add(opening_msg)

    # 6. Mark bid as SELECTED
    quote.status = "SELECTED"

    await db.commit()
    await db.refresh(conv)

    # 7. Fire WF7 — notify forwarder by email (background)
    # Link points to /forwarders/chat/{id} so portal forwarders can authenticate
    background_tasks.add_task(
        webhook_service.trigger_new_conversation_webhook,
        {
            "forwarder_email": quote.forwarder_email,
            "company_name": conv.forwarder_company,
            "shipper_name": current_user.full_name or current_user.sovereign_id,
            "request_id": data.request_id,
            "origin": req.origin,
            "destination": req.destination,
            "conversation_url": f"https://cargolink.sa/forwarders/chat/{conv.public_id}",
        }
    )

    return {"public_id": conv.public_id, "existed": False}


@router.get("/unread-count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns total unread message count for the current user.
    IMPORTANT: This route MUST appear before /{public_id} routes to avoid
    FastAPI treating 'unread-count' as a path parameter.
    """
    if current_user.role == "forwarder":
        conv_stmt = select(Conversation.id).where(
            Conversation.forwarder_id == current_user.sovereign_id
        )
    else:
        conv_stmt = select(Conversation.id).where(
            Conversation.shipper_id == current_user.sovereign_id
        )

    conv_ids_res = await db.execute(conv_stmt)
    conv_ids = [row[0] for row in conv_ids_res.all()]

    if not conv_ids:
        return {"unread_count": 0}

    count_res = await db.execute(
        select(func.count(ChatMessage.id)).where(
            ChatMessage.conversation_id.in_(conv_ids),
            ChatMessage.sender_id != current_user.sovereign_id,
            ChatMessage.is_read == False,  # noqa: E712
            ChatMessage.sender_role != "SYSTEM",
        )
    )
    return {"unread_count": count_res.scalar() or 0}


@router.get("/")
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lists all conversations for the logged-in user (shipper or forwarder).
    """
    if current_user.role == "forwarder":
        stmt = select(Conversation).where(
            Conversation.forwarder_id == current_user.sovereign_id
        ).order_by(Conversation.updated_at.desc())
    else:
        stmt = select(Conversation).where(
            Conversation.shipper_id == current_user.sovereign_id
        ).order_by(Conversation.updated_at.desc())

    res = await db.execute(stmt)
    conversations = res.scalars().all()

    result = []
    for conv in conversations:
        last_msg_res = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == conv.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_res.scalars().first()
        result.append(_conv_dict(conv, last_msg))

    return {"conversations": result}


@router.get("/{public_id}")
async def get_conversation(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns conversation metadata."""
    conv = await _get_conversation(public_id, db)

    if conv.shipper_id != current_user.sovereign_id and conv.forwarder_id != current_user.sovereign_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized.")

    return _conv_dict(conv)


@router.get("/{public_id}/messages")
async def get_messages(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all messages for a conversation. Frontend polls this every 1 second.
    Also marks messages from the other party as read on each poll.
    """
    conv = await _get_conversation(public_id, db)

    if conv.shipper_id != current_user.sovereign_id and conv.forwarder_id != current_user.sovereign_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized.")

    msgs_res = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
    )
    messages = msgs_res.scalars().all()

    # Mark incoming messages as read (messages not sent by current user, not yet read, not SYSTEM)
    unread_ids = [
        m.id for m in messages
        if m.sender_id != current_user.sovereign_id and not m.is_read and m.sender_role != "SYSTEM"
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
async def send_message(
    public_id: str,
    data: SendMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a plain TEXT message."""
    conv = await _get_conversation(public_id, db)

    if conv.shipper_id != current_user.sovereign_id and conv.forwarder_id != current_user.sovereign_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")

    sender_role = "SHIPPER" if conv.shipper_id == current_user.sovereign_id else "FORWARDER"

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role=sender_role,
        sender_id=current_user.sovereign_id,
        message_type="TEXT",
        content=data.content,
        is_read=False,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/offer")
async def send_offer(
    public_id: str,
    data: SendOfferIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Shipper sends a counter-offer (OLX-style).
    Minimum = 80% of original_price. Cannot offer MORE than original.
    """
    conv = await _get_conversation(public_id, db)

    if conv.shipper_id != current_user.sovereign_id:
        raise HTTPException(status_code=403, detail="Only the shipper can make an offer.")
    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is closed.")

    original = float(conv.original_price)
    min_offer = round(original * MIN_OFFER_RATIO, 2)

    if data.offer_amount >= original:
        raise HTTPException(
            status_code=422,
            detail=f"Offer must be less than the quoted price ({conv.currency} {original:,.2f})."
        )
    if data.offer_amount < min_offer:
        raise HTTPException(
            status_code=422,
            detail=f"Offer too low. Minimum offer is {conv.currency} {min_offer:,.2f} (80% of quoted price)."
        )

    msg = ChatMessage(
        conversation_id=conv.id,
        sender_role="SHIPPER",
        sender_id=current_user.sovereign_id,
        message_type="OFFER",
        content=f"Counter offer: {conv.currency} {data.offer_amount:,.2f}",
        offer_amount=data.offer_amount,
        is_read=False,
    )
    db.add(msg)
    conv.current_offer = data.offer_amount
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/respond-offer")
async def respond_offer(
    public_id: str,
    data: RespondOfferIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Forwarder accepts or rejects the shipper's counter-offer.
    ACCEPT → sets agreed_price, sends ACCEPTED message.
    REJECT → clears current_offer, sends REJECTED message.
    """
    conv = await _get_conversation(public_id, db)

    if conv.forwarder_id != current_user.sovereign_id:
        raise HTTPException(status_code=403, detail="Only the forwarder can respond to offers.")
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
        sender_id=current_user.sovereign_id,
        message_type=msg_type,
        content=msg_content,
        is_read=False,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return _msg_dict(msg)


@router.post("/{public_id}/close")
async def close_deal(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mutual deal close — either party can initiate, both must confirm.
    When both confirm: conversation → CLOSED, marketplace request → CLOSED,
    all other open conversations for this request → CLOSED.
    """
    conv = await _get_conversation(public_id, db)

    is_shipper = conv.shipper_id == current_user.sovereign_id
    is_forwarder = conv.forwarder_id == current_user.sovereign_id

    if not is_shipper and not is_forwarder and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized.")
    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="This conversation is already closed.")

    # Guard: already requested
    if is_shipper and conv.shipper_close_req:
        raise HTTPException(status_code=409, detail="You have already requested to close this deal.")
    if is_forwarder and conv.forwarder_close_req:
        raise HTTPException(status_code=409, detail="You have already requested to close this deal.")

    if is_shipper:
        conv.shipper_close_req = True
        other_requested = conv.forwarder_close_req
        pending_msg = "Shipper has marked this deal as closed. Waiting for forwarder to confirm."
    else:
        conv.forwarder_close_req = True
        other_requested = conv.shipper_close_req
        pending_msg = "Forwarder has marked this deal as closed. Waiting for shipper to confirm."

    if other_requested:
        # Both confirmed — fully close
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

        # Cascade: close all other OPEN conversations for this request
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
        db.add(ChatMessage(
            conversation_id=conv.id,
            sender_role="SYSTEM", sender_id="SYSTEM", message_type="SYSTEM",
            content=pending_msg,
            is_read=False,
        ))
        await db.commit()
        return {"status": "PENDING_CLOSE", "message": pending_msg}


@router.post("/{public_id}/confirm-booking")
async def confirm_booking(
    public_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Shipper confirms booking inside the chat.
    Final price = agreed_price (if negotiated) or original_price.
    Forwarder email is ONLY revealed here — injected as a SYSTEM message.
    All other open conversations for this request are auto-closed.
    """
    conv = await _get_conversation(public_id, db)

    if conv.shipper_id != current_user.sovereign_id:
        raise HTTPException(status_code=403, detail="Only the shipper can confirm the booking.")
    if conv.status != "OPEN":
        raise HTTPException(status_code=409, detail="Booking already confirmed or conversation closed.")

    # Determine final price
    final_price = float(conv.agreed_price) if conv.agreed_price is not None else float(conv.original_price)

    # Fetch forwarder email from the original quote
    quote_res = await db.execute(
        select(MarketplaceBid).where(MarketplaceBid.quotation_id == conv.quote_id)
    )
    quote = quote_res.scalars().first()
    if not quote:
        raise HTTPException(status_code=404, detail="Original quote not found.")

    forwarder_email = quote.forwarder_email

    # Generate booking reference
    reference = "BK-" + secrets.token_hex(3).upper()

    # Fetch request for origin/destination/container
    req_res = await db.execute(
        select(MarketplaceRequest).where(MarketplaceRequest.request_id == conv.request_id)
    )
    req = req_res.scalars().first()

    # Create Booking record
    booking = Booking(
        reference=reference,
        user_sovereign_id=current_user.sovereign_id,
        carrier_name=conv.forwarder_company,
        origin_locode=req.origin if req else "",
        destination_locode=req.destination if req else "",
        container_type=req.container_type or "FCL",
        transit_days=quote.transit_days if quote else None,
        total_price=final_price,
        currency=conv.currency,
        marketplace_request_id=conv.request_id,
        quote_id=conv.quote_id,
    )
    db.add(booking)

    # Close the marketplace request
    if req:
        req.status = "CLOSED"

    # Mark conversation as BOOKED
    conv.status = "BOOKED"
    conv.booking_id = reference

    # Inject SYSTEM message revealing forwarder contact
    db.add(ChatMessage(
        conversation_id=conv.id,
        sender_role="SYSTEM",
        sender_id="SYSTEM",
        message_type="SYSTEM",
        content=(
            f"✅ Booking Confirmed — {reference} | "
            f"Final Price: {conv.currency} {final_price:,.2f} | "
            f"Forwarder Contact: {forwarder_email}"
        ),
        is_read=False,
    ))

    # CASCADE: close all other OPEN conversations for this request
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
            content="This request has been booked through another conversation. No further action required.",
            is_read=False,
        ))

    await db.commit()

    # Fire WF6 — email both parties
    background_tasks.add_task(
        webhook_service.trigger_booking_webhook,
        {
            "booking_reference": reference,
            "shipper_name": current_user.full_name or current_user.sovereign_id,
            "shipper_email": current_user.email,
            "forwarder_email": forwarder_email,
            "forwarder_company": conv.forwarder_company,
            "request_id": conv.request_id,
            "final_price": final_price,
            "currency": conv.currency,
            "origin": req.origin if req else "",
            "destination": req.destination if req else "",
        }
    )

    return {
        "reference": reference,
        "forwarder_email": forwarder_email,
        "forwarder_company": conv.forwarder_company,
        "final_price": final_price,
        "currency": conv.currency,
    }
