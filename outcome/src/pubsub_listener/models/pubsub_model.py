# pylint: disable=C0115,C0116,R0903,E0213,R0201
"""Pubsub models received as pubsub messages."""
import json
from base64 import b64decode
from enum import Enum
from typing import Union

from pydantic import BaseModel, validator


class PubsubTypes(str, Enum):
    """
    PubsubTypes enum used in Attributes.

    Attributes:
        RECIPIENTS: 'recipients'.
        MESSAGE: 'message'.
    """

    RECIPIENTS = 'recipients'
    MESSAGE = 'message'


class Attributes(BaseModel):
    """
    Attributes used in PubSub.

    Attributes:
        organization_id
        bulletin
    """

    organization_id: str
    bulletin_id: str
    type: PubsubTypes


class RecipientsData(BaseModel):
    """RecipientsData used in PubSub.

    Attributes:
        hits
    """

    hits: int


class MessageData(BaseModel):
    """
    MessageData used in PubSub and a subset of attributes in `models.db.Message`.

    Attributes:
        not_reserved
        reserved
        not_active
        deleted
        mails_sent
    """

    not_reserved: int
    reserved: int
    not_active: int
    deleted: int
    mails_sent: int


class Pubsub(BaseModel):
    """Pubsub holds either `RecipientsData` or `MessageData` and `pubsub_id`."""

    attributes: Attributes
    data: Union[RecipientsData, MessageData]
    pubsub_id: str

    @validator('data', pre=True)
    def validate_data(cls, value, values):
        """
        Validate `RecipientsData` or `MessageData`.

        Decodes string from base64 and casts to either `RecipientsData` or `MessageData`
        """
        if isinstance(value, BaseModel):
            return value
        value = json.loads(b64decode(value).decode('utf-8'))
        if not isinstance(value, dict):
            raise ValueError('value must be dict')
        data_type = values['attributes'].type
        if data_type == PubsubTypes.RECIPIENTS:
            return RecipientsData(**value)
        if data_type == PubsubTypes.MESSAGE:
            return MessageData(**value)

        return None
