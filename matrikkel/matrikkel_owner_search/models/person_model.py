"""Person model."""
from pydantic import BaseModel


class Person(BaseModel):
    """This is the model for the desired Person object the message functions wants."""

    freg_identifier: str
    name: str
