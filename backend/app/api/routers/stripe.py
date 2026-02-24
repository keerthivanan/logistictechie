from fastapi import APIRouter, Depends, HTTPException, Request
import stripe
import os
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

# Stripe Configuration — reads strictly from .env
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

class CheckoutSessionRequest(BaseModel):
    company_name: str
    email: str
    phone: str
    country: str
    tax_id: str
    logo_url: str = ""
    document_url: str = ""

@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutSessionRequest):
    """
    Creates a Stripe Checkout Session for Forwarder Onboarding ($15)
    """
    try:
        session = stripe.checkout.sessions.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'OMEGO Sovereign Partner Activation: {data.company_name}',
                        'description': '30-Day Active Listing & Global Lead Access',
                    },
                    'unit_amount': 1500, # $15.00
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"http://localhost:3000/forwarders/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url="http://localhost:3000/forwarders/register",
            metadata={
                "company_name": data.company_name,
                "email": data.email,
                "phone": data.phone,
                "country": data.country,
                "tax_id": data.tax_id,
                "logo_url": data.logo_url,
                "document_url": data.document_url
            }
        )
        return {"sessionId": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
