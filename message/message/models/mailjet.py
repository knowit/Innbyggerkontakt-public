# pylint: disable=missing-class-docstring, missing-function-docstring
"""Models for mailjet API requests."""
from typing import Dict, List, Optional

from innbyggerkontakt.models.basic_persons import Person
from pydantic import BaseModel, Field

from models.freg import FregPerson
from models.krr import KrrPerson
from models.matrikkel import MatrikkelPerson


class NotTheSameNNIDNumberException(Exception):
    def __init__(self, nnid_a, nnid_b, message='') -> None:
        redacted_a = f'{nnid_a[4:]}{"*"*5}{nnid_a[:2]}'
        redacted_b = f'{nnid_b[4:]}{"*"*5}{nnid_b[:2]}'
        super().__init__(
            message=f'{message}\n{redacted_a} is not the same person as {redacted_b}'
        )


class MailjetPerson(Person):
    """All information needed to send an email through Mailjet API."""

    desired_language: Optional[str]
    name: Optional[str]
    email: str

    @classmethod
    def from_krr_and_freg(
        cls, krr_person: KrrPerson, freg_person: FregPerson
    ) -> 'MailjetPerson':
        """Create MailjetPerson from krr and freg."""
        if krr_person.personidentifikator != freg_person.freg_identifier:
            raise NotTheSameNNIDNumberException(
                krr_person.personidentifikator, freg_person.freg_identifier
            )
        name = freg_person.name
        email = krr_person.kontaktinformasjon.epostadresse
        desired_language = krr_person.spraak
        return MailjetPerson(name=name, email=email, desired_language=desired_language)

    @classmethod
    def from_krr_and_matrikkel(
        cls, krr_person: KrrPerson, matrikkel_person: MatrikkelPerson
    ) -> 'MailjetPerson':
        """Create MailjetPerson from krr and matrikkel."""
        if krr_person.personidentifikator != matrikkel_person.freg_identifier:
            raise NotTheSameNNIDNumberException(
                krr_person.personidentifikator, matrikkel_person.freg_identifier
            )
        email = krr_person.kontaktinformasjon.epostadresse
        desired_language = krr_person.spraak
        return MailjetPerson(email=email, desired_language=desired_language)


class FromTo(BaseModel):
    email: str
    name: Optional[str]


class Globals(BaseModel):
    from_: FromTo = Field(alias='from')
    subject: str
    variables: Dict[str, str]
    template_id: int = Field(alias='TemplateID')
    template_language: bool = Field(True, alias='TemplateLanguage')
    custom_campaign: str = Field(None, alias='CustomCampaign')
    deduplicate_campaign: bool = Field(True, alias='DeduplicateCampaign')


class Message(BaseModel):
    to: List[FromTo]
    variables: Dict[str, str] = None


class MailjetApiRequest(BaseModel):
    globals_: Globals = Field(alias='globals')
    messages: List[Message]
    sandbox_mode: bool = Field(False, alias='SandboxMode')
