# pylint: disable=C0115,C0116,R0903
"""Recipients request models"""
from typing import Optional, List

from pydantic import BaseModel, Field

from models.template_application import FolkeregisterpersonParts


class RecipientsRequestHeader(BaseModel):
    class Config():
        allow_population_by_field_name = True

    content_type: str = Field('application/json', alias='Content-Type')
    authorization: str = Field(..., alias='Authorization')
    organization_id: str = Field(..., alias='organization-id')
    municipality_number: str = Field(..., alias='municipality-number')
    bulletin_type: Optional[str] = Field(None, alias='bulletin-type')


class RecipientsRequestParams(BaseModel):
    parts: Optional[List[FolkeregisterpersonParts]] = None
