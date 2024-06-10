# pylint: disable=C0115,C0116,R0903
"""Models for bulletin statistics response."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class StatisticsResponse(BaseModel):
    """StatisticsResponse is returned in bulletin_router /{bulletin_id}."""

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

    bulletin_id: Optional[str] = Field(alias='bulletinId')
    datetime_created: datetime = Field(alias='datetimeCreated')
    last_updated: datetime = Field(alias='lastUpdated')
    freg_total_hits: Optional[int] = Field(alias='fregTotalHits')
    not_reserved: Optional[int] = Field(alias='notReserved')
    reserved: int
    not_active: int = Field(alias='notActive')
    deleted: int
    mails_sent: int = Field(alias='mailsSent')


class CollectionResponse(BaseModel):
    """
    CollectionResponse is returned in bulletin_router /list.

    It contains a list with `StatisticsResponse`.
    """

    class Config:
        allow_population_by_field_name = True

    page: int
    page_size: int = Field(alias='pageSize')
    total: int
    data: List[StatisticsResponse]
