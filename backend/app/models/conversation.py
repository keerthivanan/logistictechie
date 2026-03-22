from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Index, Boolean
from app.db.session import Base
from datetime import datetime, timezone
import uuid


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Conversation(Base):
    """
    Private chat thread between a shipper and a forwarder for a specific quote.
    public_id is a UUID shown in URLs — prevents enumeration attacks.
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))

    # Links
    request_id = Column(String, ForeignKey("requests.request_id", ondelete="CASCADE"), index=True)
    quote_id = Column(String, ForeignKey("quotations.quotation_id", ondelete="CASCADE"), index=True)

    # Parties (sovereign_ids only — never email)
    shipper_id = Column(String, index=True)
    forwarder_id = Column(String, index=True)
    forwarder_company = Column(String)

    # Pricing
    original_price = Column(Numeric(12, 2))       # forwarder's original quoted price
    currency = Column(String, default="USD")
    current_offer = Column(Numeric(12, 2), nullable=True)   # shipper's latest counter-offer
    agreed_price = Column(Numeric(12, 2), nullable=True)    # final price after forwarder accepts

    # Status: OPEN | BOOKED | CLOSED
    status = Column(String, default="OPEN", index=True)
    booking_id = Column(String, nullable=True)

    # Tracks who made the current pending offer: 'SHIPPER' | 'FORWARDER' | None
    offer_side = Column(String, nullable=True)

    # Mutual close flags — both must be True for status to become CLOSED (off-platform deal)
    shipper_close_req = Column(Boolean, default=False, nullable=False)
    forwarder_close_req = Column(Boolean, default=False, nullable=False)

    # Last seen — updated on every message poll. Used to show Online / Last seen X min ago
    shipper_last_seen = Column(DateTime, nullable=True)
    forwarder_last_seen = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        Index("idx_conv_shipper", "shipper_id"),
        Index("idx_conv_forwarder", "forwarder_id"),
        Index("idx_conv_quote", "quote_id"),
    )


class ChatMessage(Base):
    """
    Individual message in a conversation thread.
    message_type drives the UI rendering:
      TEXT     — normal chat bubble
      OFFER    — shipper counter-offer card with Accept/Reject buttons (forwarder sees)
      ACCEPTED — green card shown after forwarder accepts
      REJECTED — red card shown after forwarder rejects
      SYSTEM   — centered platform message (opening note, booking confirmation, etc.)
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), index=True)

    sender_role = Column(String)    # SHIPPER | FORWARDER | SYSTEM
    sender_id = Column(String)      # sovereign_id or "SYSTEM"

    message_type = Column(String, default="TEXT")   # TEXT | OFFER | ACCEPTED | REJECTED | SYSTEM
    content = Column(String)
    offer_amount = Column(Numeric(12, 2), nullable=True)    # set only for OFFER type
    is_read = Column(Boolean, default=False, nullable=False)  # True once the recipient polls this message

    created_at = Column(DateTime, default=_utcnow, index=True)
