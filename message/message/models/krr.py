# pylint: disable=C0115,C0116
"""Models for krr API."""
from datetime import datetime
from enum import Enum

from innbyggerkontakt.models.basic_persons import Person
from pydantic import BaseModel


class Status(str, Enum):
    AKTIV = "AKTIV"
    SLETTET = "SLETTET"
    IKKE_REGISTRERT = "IKKE_REGISTRERT"


class Reservasjon(str, Enum):
    NEI = "NEI"
    JA = "JA"


class Kontaktinformasjon(BaseModel):
    epostadresse: str = None
    epostadresse_oppdatert: datetime = None
    epostadresse_sist_verifisert: datetime = None


class KrrPerson(Person):
    personidentifikator: str
    reservasjon: Reservasjon = None
    status: Status
    kontaktinformasjon: Kontaktinformasjon = None
    spraak: str = None
    spraak_oppdatert: datetime = None
