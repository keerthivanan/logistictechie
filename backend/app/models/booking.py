from sqlalchemy import Column, String, Integer, DateTime, Numeric, Boolean, Index
from app.db.session import Base
from datetime import datetime, timezone
import uuid


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Booking(Base):
    """
    Records a confirmed booking made by a shipper confirming inside the chat.
    Created when shipper clicks 'Confirm Booking' inside /dashboard/messages/{id}.
    """
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    # Stable human-readable reference (e.g., BK-A3F2C1B0)
    reference = Column(String(20), unique=True, index=True, nullable=False)

    # Who booked
    user_sovereign_id = Column(String(100), index=True, nullable=False)

    # Quote details (snapshot at time of booking — source of truth)
    carrier_name = Column(String(200), nullable=False)
    vessel_name = Column(String(200), nullable=True)
    origin_locode = Column(String(20), nullable=False)
    destination_locode = Column(String(20), nullable=False)
    container_type = Column(String(20), nullable=False)
    transit_days = Column(Integer, nullable=True)
    total_price = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD")

    # Optional link to marketplace request (if quote was from forwarder bid)
    marketplace_request_id = Column(String(100), index=True, nullable=True)
    quote_id = Column(String(100), nullable=True)  # UUID from instant quote engine

    # Status: CONFIRMED, CANCELLED
    status = Column(String(20), default="CONFIRMED", index=True)

    confirmed_at = Column(DateTime, default=_utcnow, index=True)
    created_at = Column(DateTime, default=_utcnow)

    __table_args__ = (
        Index("idx_booking_user_status", "user_sovereign_id", "status"),
    )
