from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app import crud
from typing import List, Dict, Any
from datetime import datetime
import json

router = APIRouter()

@router.get("/me", response_model=Dict)
async def get_my_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    # SOVEREIGN BILLING ENGINE
    Generates real-time invoices based on the user's booking history.
    """
    try:
        bookings = await crud.booking.get_by_user(db, user_id=str(current_user.id))
        
        invoices = []
        outstanding = 0.0
        last_payment = 0.0
        
        for b in bookings:
            # Parse price from cargo_details or contact_details
            try:
                # Try to find price in stored data
                pricing = json.loads(b.contact_details) if b.contact_details else {}
                price = pricing.get("price", 1500.0) # Fallback to a baseline
            except:
                price = 1500.0
                
            status = "Paid" if b.status == "SHIPPED" else "Unpaid"
            if b.status == "CANCELLED": continue
            
            if status == "Unpaid":
                outstanding += price
            else:
                last_payment = price if price > last_payment else last_payment

            invoices.append({
                "id": f"INV-{b.booking_reference.split('-')[1]}",
                "date": b.created_at.strftime("%b %d, %Y"),
                "desc": f"Shipment #{b.booking_reference}",
                "amount": f"${price:,.2f}",
                "status": status,
                "amount_raw": price
            })
            
        # Removed mock subscription invoice for 'Best of All Time' accuracy

        return {
            "success": True,
            "data": {
                "invoices": invoices,
                "stats": {
                    "outstanding": f"${outstanding:,.2f}",
                    "last_payment": f"${last_payment:,.2f}",
                    "credit_limit": "$5,000",
                    "usage_percent": int((outstanding / 5000) * 100) if outstanding > 0 else 0
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pay/all")
async def pay_all_outstanding(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Clears all unpaid bookings for the user to simulate payment.
    """
    from sqlalchemy import update
    from app.models.booking import Booking
    
    await db.execute(
        update(Booking)
        .where(Booking.user_id == str(current_user.id), Booking.status == "PENDING")
        .values(status="CONFIRMED")
    )
    await db.commit()
    return {"success": True, "message": "All pending invoices settled. Mission status updated to CONFIRMED."}
