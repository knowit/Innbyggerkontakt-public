# pylint: disable=C0115,C0116
"""Models for message input data."""
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel

from models.freg import FregPerson
from models.mailjet import FromTo


class Status(str, Enum):
    DRAFT = 'draft'
    TEST = 'test'
    ACTIVE = 'active'
    FINISHED = 'finished'


class Identifiers(BaseModel):
    organization_id: str
    bulletin_id: str


class Attributes(Identifiers):
    status: Optional[Status] = None
    trace_string: Optional[str] = ''
    bulletin_type: str


class Language(BaseModel):
    subject: str
    variables: Dict[str, str]


class Content(BaseModel):
    from_: FromTo
    default_language: str
    language: Dict[str, Language]


class TemplateApplication(BaseModel):
    global_variables: List[str]
    local_variables: Optional[List[str]] = None
    mailjet_template: int


class RequestPerson(FregPerson):
    email: str = None


class Data(BaseModel):
    identifiers: Attributes
    content: Content
    template_application: TemplateApplication
    sandbox_mode: bool
    file_path: Optional[str] = None
    person: Optional[RequestPerson] = None
    ignore_reservation: Optional[bool] = False
    status: Optional[Status] = None


class RequestBody(BaseModel):
    data: Data
    index: int
    total: int
