from sqlalchemy import Column, String, JSON, DateTime, Integer, Float
from app.db.session import Base
from datetime import datetime
import uuid

class BroadcastLog(Base):
    """Aligns perfectly with n8n BROADCAST_LOG sheet."""
    __tablename__ = "n8n_broadcast_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    log_id = Column(String, unique=True, index=True) # Column A
    request_id = Column(String, index=True) # Column B
    forwarder_id = Column(String, index=True) # Column C
    forwarder_company = Column(String) # Column D
    email_sent = Column(String) # Column E (TRUE/FALSE)
    whatsapp_sent = Column(String) # Column F (TRUE/FALSE)
    sent_at = Column(DateTime, default=datetime.utcnow) # Column G

class EventsLog(Base):
    """Aligns perfectly with n8n EVENTS_LOG sheet."""
    __tablename__ = "n8n_events_logs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, unique=True, index=True) # Column A
    event_type = Column(String) # Column B
    request_id = Column(String, index=True) # Column C
    actor = Column(String) # Column D
    description = Column(String) # Column E
    timestamp = Column(DateTime, default=datetime.utcnow) # Column F

class AnalyticsLog(Base):
    """Aligns perfectly with n8n ANALYTICS sheet."""
    __tablename__ = "n8n_analytics"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    date = Column(String, index=True) # Column A (YYYY-MM-DD)
    total_requests = Column(Integer, default=0) # Column B
    total_quotations = Column(Integer, default=0) # Column C
    requests_closed = Column(Integer, default=0) # Column D
    avg_quotes_per_request = Column(Float, default=0.0) # Column E
    stale_requests_count = Column(Integer, default=0) # Column F

class RejectedAttempt(Base):
    """Aligns perfectly with n8n REJECTED_ATTEMPTS sheet."""
    __tablename__ = "n8n_rejected_attempts"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow) # Column A
    sender_email = Column(String) # Column B
    request_id = Column(String) # Column C
    error_type = Column(String) # Column D
    error_message = Column(String) # Column E
