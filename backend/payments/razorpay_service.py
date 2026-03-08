"""
Razorpay integration service for Milkman.
Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env to enable.
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def get_razorpay_client():
    """Return a Razorpay client if credentials are configured, else None."""
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
    if not key_id or not key_secret:
        logger.debug("Razorpay credentials not configured.")
        return None
    try:
        import razorpay
        client = razorpay.Client(auth=(key_id, key_secret))
        return client
    except ImportError:
        logger.warning("razorpay package not installed. Run: pip install razorpay")
        return None
def create_razorpay_order(amount_rupees: float, currency: str = "INR", receipt: str = "") -> dict | None:
    """
    Create a Razorpay order.
    Args:
        amount_rupees: Amount in INR (will be converted to paise).
        currency: Currency code.
        receipt: Optional receipt string (e.g. order ID).
    Returns:
        Razorpay order dict or None if not configured.
    """
    client = get_razorpay_client()
    if not client:
        return None

    try:
        amount_paise = int(amount_rupees * 100)
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "receipt": str(receipt),
            "payment_capture": 1,
        })
        return razorpay_order
    except Exception as exc:
        logger.error(f"Failed to create Razorpay order: {exc}")
        return None


def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify a Razorpay payment signature.
    Returns True if valid, False otherwise.
    """
    client = get_razorpay_client()
    if not client:
        return False

    try:
        params = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
        client.utility.verify_payment_signature(params)
        return True
    except Exception:
        return False
