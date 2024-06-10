# pylint: disable=C0115,C0116,E0213,R0201,C0103,R0903
"""Firestore bulletin model"""
import abc
from datetime import date, datetime
from enum import Enum
from typing import Dict, List, Optional, Union

import pytz
from dateutil.relativedelta import relativedelta
from pydantic import BaseModel, Field, ValidationError, root_validator, validator
from typing_extensions import Literal


def _get_all_subclasses(parent_class):
    children = parent_class.__subclasses__()
    grandchildren = []
    for child in children:
        grandchildren += _get_all_subclasses(child)
    return children + grandchildren


class Person(BaseModel):
    """Abstract Person class in order to Unify all persons."""

    def __new__(cls, **kwargs):
        """Try to cast to the lowest subclass."""
        if cls is not Person:
            return super(Person, cls).__new__(cls)

        # Go ahead and try to cast to a subclass of Person.
        excpected_types = _get_all_subclasses(Person)
        _parsed_person = None
        while not _parsed_person and excpected_types:
            _e = excpected_types.pop()
            try:
                _parsed_person = _e.parse_obj(kwargs)
                return _parsed_person
            except (TypeError, ValidationError):
                continue  # Try the next subclass.
        raise TypeError(f'Cannot instansiate a Person from {cls}.')  # Give up.


class Mottager(str, Enum):
    """Enum, either `self` or `parent`."""

    SELF = 'self'
    PARENT = 'parent'


class Status(str, Enum):
    """Enum, either `draft`, `test`, `active` or `finished`."""

    DRAFT = 'draft'
    TEST = 'test'
    ACTIVE = 'active'
    FINISHED = 'finished'


class Gender(str, Enum):
    """Enum, either `mann` or `kvinne`."""

    MANN = 'mann'
    KVINNE = 'kvinne'


class Personstatustyper(str, Enum):
    """Enum, either `aktiv`, `bosatt`, `utflyttet`, `doed` or `inaktiv`."""

    AKTIV = 'aktiv'
    BOSATT = 'bosatt'
    UTFLYTTET = 'utflyttet'
    DOED = 'doed'
    INAKTIV = 'inaktiv'


class Sivilstandstype(str, Enum):
    """
    Enum.

    either:
        `uoppgitt`,
        `ugift`,
        `gift`,
        `enkeEllerEnkemann`,
        `skilt`,
        `separert`,
        `registrertPartner`,
        `skiltPartner`,
        `separertPartner`,
        or `gjenlevendePartner`.
    """

    UOPPGITT = 'uoppgitt'
    UGIFT = 'ugift'
    GIFT = 'gift'
    ENKE_ELLER_ENKEMANN = 'enkeEllerEnkemann'
    SKILT = 'skilt'
    SEPARERT = 'separert'
    REGISTRERT_PARTNER = 'registrertPartner'
    SKILT_PARTNER = 'skiltPartner'
    SEPARERT_PARTNER = 'separertPartner'
    GJENLEVENDE_PARTNER = 'gjenlevendePartner'


class FilterType(str, Enum):
    """Filter type that determins what age-related filter has been used."""

    OLDER_THAN = 'olderThan'
    AGE_BETWEEN = 'ageBetween'
    YOUNGER_THAN = 'youngerThan'
    AFTER_DATE = 'afterDate'
    BEFORE_DATE = 'beforeDate'
    BETWEEN_DATE = 'betweenDate'
    BETWEEN_YEARS = 'betweenYears'
    TURN_X_YEARS = 'turnXYears'
    TURN_X_MONTHS = 'turnXMonths'
    TURN_X_DAYS = 'turnXDays'
    EVERYONE = 'everyone'
    BORN_BETWEEN = 'foedselsaarFraOgTilOgMed'


class BaseAge(BaseModel):
    """Abstract class."""

    filter: FilterType

    def convert_additional_dates(self):
        raise NotImplementedError()


class FoedselsaarFraOgMed(BaseAge):
    """Class for born between filter."""

    year_of_birth_from: Optional[str] = Field(
        ..., alias='foedselsaarFraOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )

    def convert_additional_dates(self):
        """Convert additional dates."""
        return {
            'year_of_birth_from': self.year_of_birth_from,
        }


class FoedselsaarTilOgMed(BaseAge):
    """Class for born between filter."""

    year_of_birth_to: Optional[str] = Field(
        ..., alias='foedselsaarTilOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )

    def convert_additional_dates(self):
        """Convert additional dates."""
        return {
            'year_of_birth_to': self.year_of_birth_to,
        }


class FoedselsaarFraOgTilOgMed(BaseAge):
    """Class for born between filter."""

    year_of_birth_from: Optional[str] = Field(
        ..., alias='foedselsaarFraOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )

    year_of_birth_to: Optional[str] = Field(
        ..., alias='foedselsaarTilOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )

    def convert_additional_dates(self):
        """Convert additional dates."""
        return {
            'year_of_birth_from': self.year_of_birth_from,
            'year_of_birth_to': self.year_of_birth_to,
        }


class OlderThan(BaseAge):
    """Is older than."""

    older_than: int = Field(..., alias='olderThan')

    def convert_additional_dates(self):
        today = date.today()
        return {'date_of_birth_to': today - relativedelta(years=self.older_than)}


class YoungerThan(BaseAge):
    younger_than: int = Field(..., alias='youngerThan')

    def convert_additional_dates(self):
        today = date.today()
        return {'date_of_birth_from': today - relativedelta(years=self.younger_than)}


class AgeBetween(BaseAge):
    from_age: int = Field(..., alias='fromAge')
    to_age: int = Field(..., alias='toAge')

    def convert_additional_dates(self):
        today = date.today()
        return {
            'date_of_birth_from': today - relativedelta(years=self.to_age),
            'date_of_birth_to': today - relativedelta(years=self.from_age),
        }


class AfterDate(BaseAge):
    after_date: date = Field(..., alias='afterDate')

    def convert_additional_dates(self):
        return {'date_of_birth_from': self.after_date}


class BeforeDate(BaseAge):
    before_date: date = Field(..., alias='beforeDate')

    def convert_additional_dates(self):
        return {'date_of_birth_to': self.before_date}


class BetweenDate(BaseAge):
    from_date: date = Field(..., alias='fromDate')
    to_date: date = Field(..., alias='toDate')

    def convert_additional_dates(self):
        return {'date_of_birth_from': self.from_date, 'date_of_birth_to': self.to_date}


class BetweenYears(BaseAge):
    to_year: int = Field(..., alias='toYear')
    from_year: int = Field(..., alias='fromYear')

    def convert_additional_dates(self):
        return {
            'year_of_birth_from': str(self.from_year),
            'year_of_birth_to': str(self.to_year),
        }


class ChangeInAge(BaseAge):
    age: int

    def convert_additional_dates(self):
        today = date.today()
        birth_date = None
        if self.filter == FilterType.TURN_X_DAYS:
            birth_date = today - relativedelta(days=self.age)
        elif self.filter == FilterType.TURN_X_MONTHS:
            birth_date = today - relativedelta(months=self.age)
        elif self.filter == FilterType.TURN_X_YEARS:
            birth_date = today - relativedelta(years=self.age)
        return {'birth_date': birth_date}


class Query(BaseModel):
    class Config:
        allow_population_by_field_name = True

    gender: Optional[Gender] = Field(None, alias='kjoenn')
    zip_codes: Optional[List[str]] = Field(None, alias='postnummer')
    include_residing_address: Optional[bool] = Field(
        None, alias='inkludererOppholdsadresse'
    )
    marital_status_types: Optional[List[Sivilstandstype]] = Field(
        None, alias='sivilstandstype'
    )
    date_of_birth_from: Optional[date] = Field(None, alias='fraFoedselsdato')
    date_of_birth_to: Optional[date] = Field(None, alias='tilFoedselsdato')
    year_of_birth_from: Optional[str] = Field(
        None, alias='foedselsaarFraOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )
    year_of_birth_to: Optional[str] = Field(
        None, alias='foedselsaarTilOgMed', max_length=4, min_length=4, regex=r'^\d{4}$'
    )
    birth_date: Optional[date] = Field(None, alias='foedselsdato')
    find_parent: Optional[Mottager] = Field(Mottager.SELF, alias='mottager')

    age: Union[
        OlderThan,
        AgeBetween,
        YoungerThan,
        AfterDate,
        BeforeDate,
        BetweenDate,
        BetweenYears,
        ChangeInAge,
        FoedselsaarFraOgTilOgMed,
        FoedselsaarTilOgMed,
        FoedselsaarFraOgMed,
    ] = Field(None, alias='alder')

    @validator('marital_status_types')
    def convert_marital_status_types_to_list(cls, v):
        return [v] if v and not isinstance(v, list) else v

    @validator('zip_codes', pre=True)
    def check_postnummer(cls, v):
        if not v:
            return None
        return v

    @validator('age', pre=True)
    def check_alder(cls, v):
        if not v:
            return None
        return v

    @root_validator
    def set_alder(cls, values):
        _age_values = values.get('age')
        if not _age_values:
            return values
        additional_dates = _age_values.convert_additional_dates()
        if additional_dates is None:
            return values
        values.update(additional_dates)

        return values

    def base_dict(self):
        response = self.dict(exclude={'age'}, by_alias=False, exclude_none=True)
        response['find_parent'] = self.find_parent != Mottager.SELF
        return response


class RecipientsMatrikkel(BaseModel):
    class Config:
        allow_population_by_field_name = True

    cabin_owners: Optional[bool] = Field(None, alias='fritidsbolig')
    oslo_reg: Optional[bool] = Field(None, alias='osloReg')


class EventType(str, Enum):
    ENDRING_I_ALDER = 'endringIAlder'
    FLYTTING_INNEN_KOMMUNEN = 'flyttingInnenKommune'
    FLYTTING_TIL_KOMMUNE = 'flyttingTilKommune'
    FLYTTE_OPPHOLDSADRESSE_INNEN_KOMMUNEN = 'flytteOppholdsadresseInnenKommunen'
    FLYTTE_OPPHOLDSADRESSE_TIL_ANNEN_KOMMUNE = 'flytteOppholdsadresseTilAnnenKommune'


class Event(BaseModel):
    event_type: EventType = Field(alias='eventType')


class MMLPerson(Person):
    email: str
    name: str


class MMLFilter(BaseModel):
    filter_id: str = Field(alias='id')
    list_name: str = Field(alias='listName')
    recipients_count: int = Field(alias='recipientsCount')
    mmlpersons: Optional[List[MMLPerson]] = Field(alias='list')
    recipient_filter: Optional[str] = Field(default=None, alias='recipientFilter')
    list_type: Optional[str] = Field(default=None, alias='listType')
    created_timestamp: datetime = Field(alias='createdTimestamp')

    class Config:
        json_encoders = {datetime: lambda v: str(int(v.timestamp() * 1000))}


class RecipientsKart(BaseModel):
    """Recipientskart."""

    filter_id: str = Field(alias='id')
    kart_type: Optional[str] = Field(alias='type')
    polygons: Optional[str]
    ownerType: Optional[bool]

    class Config:
        allow_population_by_field_name = True


class Recipients(BaseModel):
    query: Optional[List[Query]] = None
    event: Optional[Event] = None
    manual: Optional[List[MMLFilter]] = None
    matrikkel: Optional[List[RecipientsMatrikkel]] = None
    kart: Optional[List[RecipientsKart]] = None


class Language(BaseModel):
    language: str
    subject: str
    variables: Dict[str, str]


class From(BaseModel):
    email: str
    name: str


class Content(BaseModel):
    language: Dict[str, Language] = Field(alias='contentInLanguage')
    default_language: str = Field(alias='defaultLanguage')
    from_: From = Field(alias='from')

    @validator('language', pre=True)
    def convert_list_to_dict(cls, v):
        if isinstance(v, dict):
            return v
        return {content['language']: content for content in v}


class AbstractChannel(BaseModel, abc.ABC):
    """Abstract Base Class that all future Channels shall inherit."""

    name: str
    bulletin_type: str

    class Config:
        fields = {'bulletin_type': 'type'}


class SMSChannel(AbstractChannel):
    """SMS channel, can only be used with search."""

    name: Literal['sms']
    bulletin_type: Literal['search']


class EmailChannel(AbstractChannel):
    """Email channel, can be used with both event and search."""

    name: Literal['email']
    bulletin_type: Literal['event', 'search']


class ExecutionType(str, Enum):
    INSTANT = 'instant'
    CONTINUOUS = 'continuous'
    SCHEDULE = 'schedule'
    EVENT = 'event'


class Execution(BaseModel):
    date_time: Optional[datetime] = Field(None, alias='datetime')
    type: Optional[ExecutionType] = None
    cloud_task_or_schedule_id: str = Field(None, alias='cloudTaskOrScheduleId')
    delay: str = None  # Format hours/days/years

    @validator('date_time')
    def check_timezone(cls, v: datetime):
        if not v:
            return v
        if v.tzinfo is None:
            tz = pytz.timezone('Europe/Oslo')
            return tz.localize(v)
        return v

    def dict(self, *args, **kwargs):
        execution = super().dict(*args, **kwargs)
        key = 'datetime' if kwargs.get('by_alias') else 'date_time'
        if execution.get(key):
            execution[key] = self.date_time.isoformat()
        return execution


class LastChangedBy(str, Enum):
    SERVER = 'server'
    CLIENT = 'client'


class Bulletin(BaseModel):
    channel: Union[SMSChannel, EmailChannel, None] = Field(None, discriminator='name')
    kommunenummer: str
    recipients: Recipients
    content: Optional[Content]
    execution: Execution = None
    template_application_id: Optional[str] = Field(alias='templateApplicationId')
    template_application_style_id: Optional[str] = Field(
        alias='templateApplicationStyleId'
    )
    sandbox_mode: bool = Field(False, alias='sandboxMode')
    last_changed_by: LastChangedBy = Field(LastChangedBy.CLIENT, alias='lastChangedBy')
    user_id: Optional[str] = Field(None, alias='userId')
    status: Status
    sms_content: Optional[Dict] = Field(alias='smsContent')
    type: Optional[str] = None
