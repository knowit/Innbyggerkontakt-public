# pylint: disable=C0115,C0116
"""User models."""
from enum import Enum

from pydantic import BaseModel


class Role(str, Enum):
    """Basic role enum."""

    ADMIN = 'admin'
    USER = 'bruker'


class User(BaseModel):
    """Pydantic model for a user from Firebase."""

    user_id: str
    organization_id: str
    organization_role: Role
