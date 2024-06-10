"""This is a regular pydantic model for a SMS test request."""
from pydantic import BaseModel


class SMSTestRequest(BaseModel):
    """SMS test request as Pydentic base model."""

    message: str
    to: list[str]
    from_name: str
