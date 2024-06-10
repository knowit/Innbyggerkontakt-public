"""Models used in matrikkel."""
from typing import List

from pydantic import BaseModel


class MatrikkelEnhet(BaseModel):
    """MatrikkelEnhet model."""

    id: str
    owners: List[str]


class MatrikkelEnheter(BaseModel):
    """List of matrikkelenheter."""

    matrikkel_enheter_list: List[MatrikkelEnhet]
