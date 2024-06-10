"""Generic PersonList."""
from typing import List

from pydantic import BaseModel
from innbyggerkontakt.models.basic_persons import Person


class PersonList(BaseModel):
    """
    Generic PersonList.

    All persons must derive from the general class Person.
    """

    persons: List[Person]


class MailList(PersonList):
    """A normal personlist with language-str added."""

    language: str
