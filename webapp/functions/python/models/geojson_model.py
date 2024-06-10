"""Geojson model to validate geojson from frontend."""
from typing import List, Tuple

from pydantic import BaseModel


class Geometry(BaseModel):
    """Model for geometry."""

    type: str
    coordinates: List[List[Tuple[float, float]]]


class Feature(BaseModel):
    """Model for feature."""

    id: str
    type: str
    geometry: Geometry


class GeoJsonModel(BaseModel):
    """Model for geojson."""

    type: str
    features: List[Feature]
