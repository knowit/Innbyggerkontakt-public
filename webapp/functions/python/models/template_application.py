# pylint: disable=C0115,C0116,E0213,R0201
"""Firestore template_application model"""
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, validator


class FolkeregisterpersonParts(str, Enum):
    NAME = 'name'


class TemplateApplication(BaseModel):
    global_variables: List[str]
    local_variables: List[FolkeregisterpersonParts]
    mailjet_template: Optional[int] = None
    name: str

    @validator('global_variables', pre=True)
    def convert_to_list(cls, value):
        return [v.get('variable_name') for v in value]
