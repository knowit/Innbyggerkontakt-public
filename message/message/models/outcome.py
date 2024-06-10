# pylint: disable=C0115,C0116
"""Models for Outcome bupsub."""
from pydantic import BaseModel


class OutcomeData(BaseModel):
    not_reserved: int
    reserved: int
    not_active: int
    deleted: int
    mails_sent: int


class PubsubOutcome(BaseModel):
    data: OutcomeData
    bulletin_id: str
    organization_id: str
    type: str = 'message'
