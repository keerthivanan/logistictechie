import httpx
import logging
from typing import Any, Dict
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("cargolink.webhook")

_shared_client: httpx.AsyncClient | None = None

def _get_client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=3.0))
    return _shared_client

class WebhookService:
    """
    Sovereign Webhook Protocol: Dispatches tactical data to n8n and external mission controllers.
    """

    def __init__(self):
        self.forwarder_webhook = os.getenv("N8N_FORWARDER_REGISTER_WEBHOOK")
        self.marketplace_webhook = os.getenv("N8N_MARKETPLACE_SUBMIT_WEBHOOK")
        self.forwarder_decision_webhook = os.getenv("N8N_FORWARDER_DECISION_WEBHOOK")
        self.booking_webhook = os.getenv("N8N_BOOKING_WEBHOOK")
        self.quotes_complete_webhook = os.getenv("N8N_QUOTES_COMPLETE_WEBHOOK")
        self.new_conversation_webhook = os.getenv("N8N_NEW_CONVERSATION_WEBHOOK")
        self.bid_confirmation_webhook = os.getenv("N8N_BID_CONFIRMATION_WEBHOOK")
        self.password_reset_webhook = os.getenv("N8N_PASSWORD_RESET_WEBHOOK")
        self.welcome_webhook = os.getenv("N8N_WELCOME_WEBHOOK")
        if not os.getenv("OMEGO_API_SECRET", ""):
            logger.warning("[CRITICAL] OMEGO_API_SECRET is empty. Webhook authentication is bypassed!")

    async def _trigger(self, url: str, payload: Dict[str, Any], event_name: str):
        if not url:
            logger.warning(f"[WEBHOOK] Missing URL for event: {event_name}. Telemetry suppressed.")
            return False

        try:
            api_secret = os.getenv("OMEGO_API_SECRET", "")
            headers = {
                "Authorization": f"Bearer {api_secret}",
                "X-OMEGO-Auth": api_secret,
                "Content-Type": "application/json"
            }
            response = await _get_client().post(url, json=payload, headers=headers)
            response.raise_for_status()
            logger.info(f"[WEBHOOK] {event_name} dispatched to {url}")
            try:
                return response.json()
            except Exception:
                return {"success": True, "raw_text": response.text}
        except Exception as e:
            logger.error(f"[WEBHOOK] Failed to dispatch {event_name}: {e}")
            return None

    async def trigger_registration_webhook(self, forwarder_data: Dict[str, Any]):
        """
        Pushes new forwarder registration data to n8n for Excel storage and WhatsApp notification.
        """
        return await self._trigger(
            self.forwarder_webhook, 
            forwarder_data, 
            "FORWARDER_REGISTER"
        )

    async def trigger_forwarder_decision_webhook(self, decision_data: Dict[str, Any]):
        """
        Fires when admin approves or rejects a forwarder application.
        Payload includes decision (APPROVED/REJECTED), company details, and forwarder email.
        n8n sends the appropriate email to the forwarder.
        """
        return await self._trigger(
            self.forwarder_decision_webhook,
            decision_data,
            "FORWARDER_DECISION"
        )

    async def trigger_marketplace_webhook(self, request_data: Dict[str, Any]):
        """
        Pushes new cargo shipment requests to n8n for Excel storage and forwarder broadcasting.
        """
        return await self._trigger(
            self.marketplace_webhook, 
            request_data, 
            "MARKETPLACE_SUBMIT"
        )

    async def trigger_quotes_complete_webhook(self, payload: dict):
        """
        Fires when 3 quotes are received via the portal (not email path).
        n8n WF3 equivalent: sends comparison email to the shipper.
        Set N8N_QUOTES_COMPLETE_WEBHOOK to the WF3 webhook URL (add a second
        trigger node to WF3 — a Webhook trigger alongside the Execute Workflow trigger).
        """
        return await self._trigger(
            self.quotes_complete_webhook,
            payload,
            "QUOTES_COMPLETE"
        )

    async def trigger_new_conversation_webhook(self, payload: dict):
        """
        Fires when a shipper clicks 'Chat with Forwarder' on a quote.
        n8n WF7 sends an email to the forwarder: 'A shipper is interested — log in to chat.'
        Set N8N_NEW_CONVERSATION_WEBHOOK to the WF7 webhook URL.
        """
        return await self._trigger(
            self.new_conversation_webhook,
            payload,
            "NEW_CONVERSATION"
        )

    async def trigger_booking_webhook(self, booking_data: dict):
        """
        Fires after a booking is confirmed.
        n8n sends a 'Booking Confirmed' email to the shipper.
        """
        return await self._trigger(
            self.booking_webhook,
            booking_data,
            "BOOKING_CONFIRMED"
        )

    async def trigger_password_reset_webhook(self, payload: dict):
        """
        Fires in two cases:
        1. User requests reset link → is_confirmation=False → n8n sends reset link email
        2. Password successfully changed → is_confirmation=True → n8n sends security alert email
        Payload keys: email, full_name, reset_url, is_confirmation, alert
        """
        return await self._trigger(
            self.password_reset_webhook,
            payload,
            "PASSWORD_RESET"
        )

    async def trigger_welcome_webhook(self, payload: dict):
        """
        Fires when a new shipper registers on CargoLink.
        n8n WF_WELCOME sends a welcome email from support@ with account details.
        Payload keys: email, full_name, company_name, sovereign_id, registered_at
        """
        return await self._trigger(
            self.welcome_webhook,
            payload,
            "USER_WELCOME"
        )

    async def trigger_bid_confirmation_webhook(self, payload: dict):
        """
        Fires after a forwarder submits a quote via the portal dashboard.
        n8n sends a confirmation email to the forwarder:
        'Your quote of $X for request {request_id} has been submitted successfully.'
        Payload keys: forwarder_email, forwarder_company, forwarder_id,
                      request_id, origin, destination, price, currency, submitted_at
        """
        return await self._trigger(
            self.bid_confirmation_webhook,
            payload,
            "BID_CONFIRMATION"
        )

webhook_service = WebhookService()
