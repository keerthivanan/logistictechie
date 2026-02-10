from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base
from datetime import datetime
import uuid

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"))
    user_id = Column(String, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    status = Column(String, default="COMPLETED") # COMPLETED, PENDING, FAILED
    payment_method = Column(String) # Stripe, PayPal, etc.
    transaction_reference = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="payment")
    user = relationship("User", back_populates="payments")
