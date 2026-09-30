"""
VarunaWatch Backend - Twilio Emergency Dispatch Service
Automated Voice Calls & SMS for Early Warning Triggers using HTTPS Protocol Security
"""
import logging
import httpx
from typing import Optional, Dict, Any
from config import settings

logger = logging.getLogger("varuna.twilio")


async def dispatch_emergency_call(
    to_number: Optional[str] = None,
    message_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Triggers an automated emergency voice call via Twilio Voice API over secure HTTPS.
    Uses Basic Auth protocol with Account SID and Auth Token.
    """
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_FROM_NUMBER
    to_phone = to_number or settings.TWILIO_EMERGENCY_CONTACT

    if not account_sid or not auth_token or not from_number or not to_phone:
        logger.warning("Twilio credentials or phone numbers not fully configured.")
        return {
            "success": False,
            "status": "unconfigured",
            "message": "Twilio credentials or destination number missing in backend configuration."
        }

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json"
    webhook_url = message_url or "https://webhooks.twilio.com/v1/Voice/Template/voice_speech_recognition"

    data = {
        "To": to_phone,
        "From": from_number,
        "Url": webhook_url
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                data=data,
                auth=(account_sid, auth_token),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code in (200, 201):
                result = response.json()
                logger.info("Twilio emergency call successfully dispatched to %s (SID: %s)", to_phone, result.get("sid"))
                return {
                    "success": True,
                    "status": result.get("status"),
                    "call_sid": result.get("sid"),
                    "to": to_phone
                }
            else:
                logger.error("Twilio API error %s: %s", response.status_code, response.text)
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text
                }
    except Exception as e:
        logger.error("Failed to connect to Twilio API: %s", str(e))
        return {
            "success": False,
            "error": str(e)
        }
