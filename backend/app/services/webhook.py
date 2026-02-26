import httpx
import logging
from typing import Any, Dict
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("omego.webhook")

class WebhookService:
    """
    Sovereign Webhook Protocol: Dispatches tactical data to n8n and external mission controllers.
    """
    
    def __init__(self):
        self.forwarder_webhook = os.getenv("N8N_FORWARDER_REGISTER_WEBHOOK")
        self.marketplace_webhook = os.getenv("N8N_MARKETPLACE_SUBMIT_WEBHOOK")

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
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=20.0)
                response.raise_for_status()
                logger.info(f"[WEBHOOK] Event {event_name} dispatched securely to {url}")
                try:
                    return response.json()
                except Exception:
                    return {"success": True, "raw_text": response.text}
        except Exception as e:
            logger.error(f"[WEBHOOK] Mission Failure: Failed to dispatch {event_name} to {url}. Error: {e}")
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

    async def trigger_marketplace_webhook(self, request_data: Dict[str, Any]):
        """
        Pushes new cargo shipment requests to n8n for Excel storage and forwarder broadcasting.
        """
        return await self._trigger(
            self.marketplace_webhook, 
            request_data, 
            "MARKETPLACE_SUBMIT"
        )

webhook_service = WebhookService()
