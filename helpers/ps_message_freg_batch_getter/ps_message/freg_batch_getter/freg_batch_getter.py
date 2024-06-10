"""Module for FregBatchGetter class."""
from typing import Optional

from cloud_event_model import JsonModel


class FregBatchGetter(JsonModel):
    """Message class for Freg Batch Getter."""

    batch_number: int
    jobb_id: str
    bulletin_id: str
    organization_id: Optional[str]
