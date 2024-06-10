# pylint: disable=C0115,C0116
"""User models"""
from typing import List
from pydantic import BaseModel, Field


class UserData(BaseModel):
    user_id: str = Field(alias='localId')
    email: str = Field(alias='email', default='')
    display_name: str = Field(alias='displayName', default='')
    email_verified: bool = Field(alias='emailVerified', default=False)
    last_login: str = Field(alias='lastLoginAt', default='')


class UserDataListWrapper(BaseModel):
    users: List[UserData]
