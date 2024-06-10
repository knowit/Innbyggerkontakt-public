# pylint: disable=C0115,C0116
"""Models for freg events."""
import logging
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from models.freg_model import ResidentialAddress  # , ResidingAddress


class FregEventType(str, Enum):
    """Enum, contains supported FregEventType s."""

    #  Only add supported types
    #  person_er_utflyttet = 'personErUtflyttet'
    #  endring_i_foreldreansvar = 'endringIForeldreansvar'
    #  endring_i_kontaktinformasjon = 'endringIKontaktinformasjon'
    #  person_er_opprettet = 'personErOpprettet'
    #  endring_i_sivilstand = 'endringISivilstand'
    #  endring_i_familierelesjon = 'endringIFamilierelasjon'
    #  person_er_doed = 'personErDoed'
    #  endring_i_navn = 'endringINavn'
    CHANGE_IN_RESIDENTIAL_ADDRESS = 'endringIBostedsadresse'
    #  CHANGE_IN_RESIDING_ADDRESS = 'endringIOppholdsadresse'
    OTHER = 'other'


def get_part_for_event_type(event_type: FregEventType):
    """Get part for event type."""
    return {
        FregEventType.CHANGE_IN_RESIDENTIAL_ADDRESS: 'bostedsadresse',
        #  FregEventType.CHANGE_IN_RESIDING_ADDRESS: 'oppholdsadresse'
    }.get(event_type, None)


class BaseEvent(BaseModel):
    """Base event."""

    freg_identifier: str = Field(alias='folkeregisteridentifikator')
    event_type: FregEventType = Field(alias='hendelsetype')
    update_time: Optional[datetime] = Field(None, alias='ajourholdstidspunkt')

    def __init__(self, **kwargs):
        event_type = kwargs.get('hendelsetype')
        if event_type not in [item.value for item in FregEventType]:
            kwargs['hendelsetype'] = FregEventType.OTHER
        super().__init__(**kwargs)


class Event(BaseEvent):
    """Event."""

    event_document: str = Field(alias='hendelsesdokument')
    person_document: Optional[str] = Field(None, alias='persondokument')


class EventWrapper(BaseModel):
    """EventWrapper."""

    sequence_number: int = Field(alias='sekvensnummer')
    event: Event = Field(alias='hendelse')

    @validator('event')
    def check_event_contains_person_document(  # pylint: disable=no-self-argument,no-self-use
        cls, value: Event, values: dict
    ):
        """Check that an event contains `person_document` attribute."""
        if not value.person_document:
            logging.getLogger(__name__).error(
                "Event with sequence number ['%d'] is missing value ['person_document']",
                values['sequence_number'],
            )
        return value


class InternalEventType(str, Enum):
    """InternalEventType."""

    MOVE_WITHIN_MUNICIPALITY = 'flyttingInnenKommune'  # 'moveWithinMunicipality'
    MOVE_TO_MUNICIPALITY = 'flyttingTilKommune'  # 'moveToMunicipality'
    #  MOVE_RESIDING_ADDRESS_WITHIN_MUNICIPALITY = 'flytteOppholdsadresseInnenKommunen'
    # 'moveResidingAddressWithinMunicipality'
    #  MOVE_RESIDING_ADDRESS_TO_MUNICIPALITY = 'flytteOppholdsadresseTilAnnenKommune'
    # 'moveResidingAddressToMunicipality'


class PropertyEvent(BaseModel):
    """PropertyEvent."""

    class Entity(str, Enum):
        # Only add supported types
        RESIDENTIAL_ADDRESS = 'bostedsadresse'
        #  RESIDING_ADDRESS = 'oppholdsadresse'

    class EntityChange(str, Enum):
        REGISTER_NEW = 'registrereNy'
        CANCEL = 'annullere'
        CORRECTING = 'korrigere'

    entity: Entity = Field(alias='entitet')
    entity_change: EntityChange = Field(alias='entitetsendring')
    residential_address: Optional[ResidentialAddress] = Field(
        None, alias='bostedsadresse'
    )
    #  residing_address: Optional[ResidingAddress] = Field(None, alias='oppholdsadresse')


class DetailedEvent(BaseEvent):
    """DetailedEvent."""

    propert_event: List[PropertyEvent] = Field(alias='egenskapshendelse')


class EventDocument(BaseModel):
    """EventDocument."""

    document_identifier: str = Field(alias='dokumentidentifikator')
    schema_version: str = Field(alias='skjemaversjon')
    event: DetailedEvent = Field(alias='hendelse')


class Lookup(BaseModel):
    """Lookup."""

    document_identifier: str = Field(alias='dokumentidentifikator')
    event_document: EventDocument = Field(alias='hendelsedokument')


class EventLookup(BaseModel):
    """EventLookup."""

    lookup: List[Lookup] = Field(None, alias='oppslag')
