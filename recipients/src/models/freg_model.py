# pylint: disable=C0115,C0116
"""Freg person models"""
from enum import Enum
from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, Field


class Metadata(BaseModel):
    update_time: Optional[datetime] = Field(None, alias='ajourholdstidspunkt')
    validity_time: Optional[datetime] = Field(None, alias='gyldighetstidspunkt')
    termination_time: Optional[datetime] = Field(None, alias='opphoerstidspunkt')
    are_ruling: bool = Field(None, alias='erGjeldende')
    source: Optional[str] = Field(None, alias='kilde')
    reason: Optional[str] = Field(None, alias='aarsak')


class MaritalStatusType(str, Enum):
    UNSPECIFIED = 'uoppgitt'
    NOT_MARRIED = 'ugift'
    MARRIED = 'gift'
    WIDOW_OR_WIDOWER = 'enkeEllerEnkemann'
    DIVORCED = 'skilt'
    SEPARATED = 'separert'
    REGISTERED_PARTNER = 'registrertPartner'
    DIVORCED_PARTNER = 'skiltPartner'
    SEPARATED_PARTNER = 'separertPartner'
    REMAINING_PARTNER = 'gjenlevendePartner'


class MaritalStatus(Metadata):
    marital_status: MaritalStatusType = Field(..., alias='sivilstand')
    marital_status_date: Optional[date] = Field(None, alias='sivilstandsdato')
    authority: Optional[str] = Field(None, alias='myndighet')
    municipality: Optional[str] = Field(None, alias='kommune')
    location: Optional[str] = Field(None, alias='sted')
    abroad: Optional[str] = Field(None, alias='utland')
    related_by_marital_status: Optional[str] = Field(None, alias='relatertVedSivilstand')


class Status(Metadata):
    class PersonStatus(str, Enum):
        RESIDENT = 'bosatt'
        RELOCATED = 'utflyttet'
        DISAPPEARED = 'forsvunnet'
        DEAD = 'doed'
        CEASED = 'opphoert'
        BIRTH_REGISTERED = 'foedselsregistrert'
        TEMPORARY = 'midlertidig'
        INACTIVE = 'inaktiv'
        NON_RESIDENT = 'ikkeBosatt'
        ACTIVE = 'aktiv'

    status: PersonStatus


class IdentificationNumber(Metadata):
    class IdentifierStatusCode(str, Enum):
        IN_USE = 'iBruk'
        CEASED = 'opphoert'

    class FregIdentifierType(str, Enum):
        BIRTH_NUMBER = 'foedselsnummer'
        D_NUMBER = 'dNummer'

    status: IdentifierStatusCode
    birth_or_d_number: str = Field(alias='foedselsEllerDNummer')
    identifier_type: FregIdentifierType = Field(alias='identifikatortype')


class Birth(Metadata):
    date_of_birth: Optional[date] = Field(None, alias='foedselsdato')
    year_of_birth: Optional[str] = Field(None, alias='foedselsaar')
    place_of_birth: Optional[str] = Field(None, alias='foedested')
    municipality_of_birth_in_norway: Optional[str] = Field(None, alias='foedekommuneINorge')
    country_of_birth: Optional[str] = Field(None, alias='foedeland')


class Name(Metadata):
    first_name: str = Field(alias='fornavn')
    middle_name: Optional[str] = Field(None, alias='mellomnavn')
    surname: str = Field(alias='etternavn')
    abbreviated_name: Optional[str] = Field(alias='forkortetNavn')

    def get(self):
        """This change in return value is to accommodate current restrictions.
         If restrictions change, this might yet be useful, therefore it is kept"""
        return self.first_name.title()
        # return ' '.join('{} {} {}'.format(self.first_name.capitalize(),
        #       (self.middle_name or '').capitalize(), self.surname.capitalize()).split())


class Gender(Metadata):
    class InternalGender(str, Enum):
        MAN = 'mann'
        WOMAN = 'kvinne'
    gender: InternalGender = Field(alias='kjoenn')


class ParentalResponsibility(Metadata):
    class ParentalResponsibilityType(str, Enum):
        COMMON = 'felles'
        MOTHER = 'mor'
        FATHER = 'far'
        CO_MOTHER = 'medmor'
        OTHER = 'andre'
        UNKNOWN = 'ukjent'
    responsibility: ParentalResponsibilityType = Field(alias='ansvar')
    subject_of_liability: Optional[str] = Field(None, alias='ansvarssubjekt')
    responsible: Optional[str] = Field(None, alias='ansvarlig')


class PostOffice(BaseModel):
    postal_name: Optional[str] = Field(None, alias='poststedsnavn')
    zip_code: Optional[str] = Field(None, alias='postnummer')


class AddressGrading(str, Enum):
    UNGRADED = 'ugradert'
    CLIENT_ADDRESS = 'klientadresse'
    CONFIDENTIAL = 'fortrolig'
    STRICTLY_CONFIDENTIAL = 'strengtFortrolig'


class RoadAddress(BaseModel):
    municipality_number: str = Field(alias='kommunenummer')
    post_office: Optional[PostOffice] = Field(None, alias='poststed')


class CadastreAddress(BaseModel):
    class CadastreNumber(BaseModel):
        municipality_number: str = Field(alias='kommunenummer')

    cadastre_number: CadastreNumber = Field(alias='matrikkelnummer')
    post_office: Optional[PostOffice] = Field(None, alias='poststed')


class Address(Metadata):
    address_identifier_from_the_cadastre: Optional[str] = Field(None, alias='adresseIdentifikatorFraMatrikkelen')
    address_grading: AddressGrading = Field(alias='adressegradering')
    road_address: Optional[RoadAddress] = Field(None, alias='vegadresse')
    cadastre_address: Optional[CadastreAddress] = Field(None, alias='matrikkeladresse')


class ResidentialAddress(Address):
    class UnknownPlaceOfResidence(BaseModel):
        municipality_number: Optional[str] = Field(None, alias='bostedskommune')

    moving_date: Optional[date] = Field(None, alias='flyttedato')
    unknown_place_of_residence: Optional[UnknownPlaceOfResidence] = Field(
        UnknownPlaceOfResidence(), alias='ukjentBosted')


class ResidingAddress(Address):
    residing_address_date: Optional[date] = Field(alias='oppholdsadressedato')


class FregPerson(BaseModel):
    status: Optional[List[Status]] = []
    identification_number: Optional[List[IdentificationNumber]] = Field([], alias='identifikasjonsnummer')
    birth: Optional[List[Birth]] = Field([], alias='foedsel')
    name: Optional[List[Name]] = Field([], alias='navn')
    gender: Optional[List[Gender]] = Field([], alias='kjoenn')
    parental_responsibility: Optional[List[ParentalResponsibility]] = Field([], alias='foreldreansvar')
    residential_address: Optional[List[ResidentialAddress]] = Field([], alias='bostedsadresse')
    residing_address: Optional[List[ResidingAddress]] = Field([], alias='oppholdsadresse')
    marital_status: Optional[List[MaritalStatus]] = Field([], alias='sivilstand')


class Person(BaseModel):
    birth_or_d_number: str = Field(alias='foedselsEllerDNummer')
    document_identifier: Optional[str] = Field(None, alias='dokumentidentifikator')
    freg_person: FregPerson = Field(alias='folkeregisterperson')

    def __eq__(self, other):
        return self.birth_or_d_number == other.birth_or_d_number

    def __hash__(self):
        return hash(('birth_or_d_number', self.birth_or_d_number))

    def convert_to_storage(self):
        name = next((name for name in self.freg_person.name if name.are_ruling), None)
        name = name.get() if name else None
        return {
            'freg_identifier': self.birth_or_d_number,
            'name': name or ''
        }


class Lookup(BaseModel):
    lookup: List[Person] = Field([], alias='oppslag')
