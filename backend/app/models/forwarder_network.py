from sqlalchemy import Column, String, Integer, Numeric, DateTime, Boolean, Text, Index
from app.db.session import Base
from datetime import datetime, timezone
import uuid


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class F2FRequest(Base):
    """
    A freight request posted by a forwarder into the F2F network.
    Other forwarders can browse and quote on these — completely separate from the shipper marketplace.
    """
    __tablename__ = "f2f_requests"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))

    posted_by_id = Column(String, index=True)       # forwarder_id of poster
    posted_by_company = Column(String)

    origin = Column(String)
    destination = Column(String)
    cargo_type = Column(String)                      # FCL | LCL | AIR | ROAD
    commodity = Column(String, nullable=True)
    weight_kg = Column(Numeric(12, 2), nullable=True)
    container_type = Column(String, nullable=True)   # 20GP | 40GP | 40HC etc.
    incoterms = Column(String, nullable=True)
    currency = Column(String, default="USD")
    notes = Column(Text, nullable=True)

    status = Column(String, default="OPEN", index=True)   # OPEN | MATCHED | CLOSED
    quote_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        Index("idx_f2f_req_poster", "posted_by_id"),
        Index("idx_f2f_req_status", "status"),
    )


class F2FQuote(Base):
    """
    A quote submitted by one forwarder on another forwarder's F2F request.
    """
    __tablename__ = "f2f_quotes"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, index=True)         # FK → f2f_requests.id
    request_public_id = Column(String, index=True)   # denormalised for easy lookup

    forwarder_id = Column(String, index=True)        # who quoted
    company_name = Column(String)

    price = Column(Numeric(12, 2))
    currency = Column(String, default="USD")
    transit_days = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    status = Column(String, default="PENDING", index=True)  # PENDING | ACCEPTED | REJECTED

    created_at = Column(DateTime, default=_utcnow)


class F2FConversation(Base):
    """
    Negotiation thread between the forwarder who posted (requester) and the forwarder
    whose quote was accepted (quoter). status: OPEN → CONFIRMED → CLOSED.
    """
    __tablename__ = "f2f_conversations"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))

    request_id = Column(Integer, index=True)         # FK → f2f_requests.id
    request_public_id = Column(String, index=True)

    requester_id = Column(String, index=True)        # forwarder who posted the request
    quoter_id = Column(String, index=True)           # forwarder whose quote was accepted
    requester_company = Column(String)
    quoter_company = Column(String)

    agreed_price = Column(Numeric(12, 2), nullable=True)
    currency = Column(String, default="USD")

    status = Column(String, default="OPEN", index=True)   # OPEN | CONFIRMED | CLOSED
    requester_confirmed = Column(Boolean, default=False)
    quoter_confirmed = Column(Boolean, default=False)

    # Last seen — used for online indicator (same pattern as shipper chat)
    requester_last_seen = Column(DateTime, nullable=True)
    quoter_last_seen = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        Index("idx_f2f_conv_requester", "requester_id"),
        Index("idx_f2f_conv_quoter", "quoter_id"),
    )


class F2FMessage(Base):
    """Individual message in an F2F conversation."""
    __tablename__ = "f2f_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, index=True)    # FK → f2f_conversations.id

    sender_id = Column(String)                       # forwarder_id
    sender_role = Column(String)                     # REQUESTER | QUOTER

    content = Column(Text)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=_utcnow, index=True)
