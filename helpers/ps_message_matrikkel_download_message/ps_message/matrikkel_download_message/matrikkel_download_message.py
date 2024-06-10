"""Matrikkel download message model."""

from cloud_event_model import JsonModel


class MatrikkelDownloadMessage(JsonModel):
    """Data from cloud event."""

    municipality_number: str
    batch_number: int
    from_matrikkel_id: int
