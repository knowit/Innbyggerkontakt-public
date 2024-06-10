# pylint: disable=C0115,C0116
"""Mailjet reponse model"""
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


class MailjetStatus(str, Enum):
    SUCCESS = 'success'
    ERROR = 'error'


class MailjetError(BaseModel):
    error_identifier: str = Field(alias='ErrorIdentifier')
    error_code: str = Field(alias='ErrorCode')
    status_code: int = Field(alias='StatusCode')
    error_message: str = Field(alias='ErrorMessage')
    error_related_to: Optional[List[str]] = Field(None, alias='ErrorRelatedTo')


class Message(BaseModel):
    errors: Optional[List[MailjetError]] = Field(None, alias='Errors')
    status: MailjetStatus = Field(alias='Status')


class MailjetResponseModel(BaseModel):
    messages: List[Message] = Field(alias='Messages')
