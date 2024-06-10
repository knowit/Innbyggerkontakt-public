"""SMS Model to send to Sinch."""
from pydantic import BaseModel


class SMSModel(BaseModel):
    """SMS Model to send to Sinch.."""

    message_id: str
    from_name: str
    to_list: list[str]
    message: str
