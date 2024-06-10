"""Models for the expected pub/sub event."""
from cloud_event_model import JsonModel


class MatrikkelOwnerSearchEvent(JsonModel):
    """Cloud event model for SMS events."""

    organization_id: str
    bulletin_id: str
    municipality_number: str
    current_batch: int  # 0 indexed
    total_batches: int
    filter_id: str
