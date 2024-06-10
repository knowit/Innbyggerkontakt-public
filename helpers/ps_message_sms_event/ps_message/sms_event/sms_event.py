"""Models for the expected pub/sub event."""
from cloud_event_model import JsonModel


class SMSEvent(JsonModel):
    """Cloud event model for SMS events."""

    organization_id: str
    bulletin_id: str
    jobb_id: str
    batch_number: int
    k_number: str
    language: str = 'nb'
