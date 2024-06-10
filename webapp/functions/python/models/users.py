# pylint: disable=C0115,C0116,E0213,R0201,C0103,R0903
"""User model"""
from pydantic import BaseModel, Field


class User(BaseModel):
    class Config():
        allow_population_by_field_name = True

    organization_id: str = Field(alias='orgId')
    rolle: str = None
