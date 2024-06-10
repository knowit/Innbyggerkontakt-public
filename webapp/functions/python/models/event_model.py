# pylint: disable=C0115,C0116,E0213,R0201,C0103
"""Event model"""
import base64
import json

from pydantic import BaseModel, validator

from models.bulletin import EventType


class Attributes(BaseModel):
    event_type: EventType


class Data(BaseModel):
    municipality_number: str
    freg_identifier: str


class PubSubEvent(BaseModel):
    attributes: Attributes
    data: Data

    @validator('data', pre=True)
    def base64decode(cls, v):
        if isinstance(v, dict):
            return v
        return json.loads(base64.b64decode(v).decode('utf-8'))
