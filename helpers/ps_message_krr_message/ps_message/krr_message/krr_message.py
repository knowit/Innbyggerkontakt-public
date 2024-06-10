"""KRR-models."""

from typing import Optional

from cloud_event_model import JsonModel


class KRRMessage(JsonModel):
    """Data from cloud event."""

    organization_id: Optional[str]
    jobb_id: str
    bulletin_id: str
    batch_number: int
    k_number: int
