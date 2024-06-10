# pylint: disable=C0115,C0116,C0103,E0213,R0201
"""Message models"""
import base64
import json
from typing import Optional, Union

from pydantic import BaseModel, validator

from models.bulletin import Content, Status
from models.template_application import TemplateApplication


class Identifiers(BaseModel):
    """User identifiers."""

    bulletin_id: str
    organization_id: str


class Attributes(Identifiers):
    """Pubsub message attributes."""

    status: Optional[Status] = None
    bulletin_type: str


class DataPerson(BaseModel):
    freg_identifier: str
    name: str
    email: Optional[str] = None


class DataBatch(BaseModel):
    """Batch of persons from recipients."""

    hits: int
    path: str


class Event(BaseModel):
    """Pubsub event."""

    attributes: Attributes
    data: Union[DataPerson, DataBatch] = None

    @validator('data', pre=True)
    def base64decode(cls, v):
        if not isinstance(v, dict):
            v = json.loads(base64.b64decode(v).decode('utf-8'))
        return v


class CloudTask(BaseModel):
    """CloudTask request body for message module."""

    identifiers: Attributes
    content: Content
    template_application: TemplateApplication
    sandbox_mode: bool
    file_path: Optional[str] = None
    person: Optional[DataPerson] = None
    ignore_reservation: Optional[bool] = None
    status: Optional[Status] = None
