import json
from base64 import b64decode
from datetime import datetime
from typing import Dict

from pydantic import BaseModel, Field, validator


class Resource(BaseModel):
    """Resource."""

    labels: Dict[str, str] = {}
    type: str = ''


class Data(BaseModel):
    """LogData."""

    insert_id: str = Field('', alias='insertId')
    labels: Dict[str, str] = {}
    log_name: str = Field('', alias='logName')
    receive_timestamp: datetime = Field(datetime.now(), alias='receiveTimestamp')
    resource: Resource = Resource()
    severity: str = ''
    text_payload: str = Field('', alias='textPayload')
    timestamp: datetime = datetime.now()
    trace: str = ''


class PubsubEvent(BaseModel):
    """PubsubLogEvent."""

    data: Data

    @validator('data', pre=True)
    def validate_data(cls, value, values):
        return json.loads(b64decode(value).decode('utf-8'))
