"""Models for the expected pub/sub event."""
from typing import List

from cloud_event_model import JsonModel
from pydantic import BaseModel


class Polygon(BaseModel):
    """Polygon model."""

    koordinatsystemKodeId: int = 24
    ytreAvgrensning: List[List[float]]


class MatrikkelSearchEvent(JsonModel):
    """Cloud event model for SMS events."""

    organization_id: str
    bulletin_id: str
    municipality_number: str
    polygons: List[Polygon]
    filter_id: str
