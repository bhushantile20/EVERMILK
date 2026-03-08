"""
Telegram notification service for Milkman.
Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env to enable.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def send_telegram_message(chat_id: str, message: str) -> bool:
    """
    Send a Telegram message to the given chat_id.
    Returns True on success, False on failure.
    Silently no-ops if TELEGRAM_BOT_TOKEN is not configured.
    """
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not bot_token or not chat_id:
        logger.debug("Telegram not configured or no chat_id – skipping notification.")
        return False

    try:
        import requests
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML",
        }
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            logger.info(f"Telegram message sent to {chat_id}")
            return True
        else:
            logger.warning(f"Telegram API error {response.status_code}: {response.text}")
            return False
    except Exception as exc:
        logger.error(f"Failed to send Telegram message: {exc}")
        return False


def send_subscription_activated_message(user, order) -> bool:
    """
    Notify a user via Telegram when their subscription/order is activated.
    """
    chat_id = getattr(user, 'telegram_chat_id', None)
    if not chat_id:
        return False

    message = (
        f"🥛 <b>Milkman Order Confirmed!</b>\n\n"
        f"Hi <b>{user.username}</b>,\n"
        f"Your order <b>#{order.id}</b> worth <b>₹{order.total_amount}</b> has been confirmed.\n\n"
        f"Thank you for choosing Milkman! 🌿"
    )
    return send_telegram_message(chat_id, message)
