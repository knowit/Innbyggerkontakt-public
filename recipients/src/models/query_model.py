"""API input model"""
from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, validator

from models import freg_model


class BulletinType(str, Enum):
    """Bulletin type"""

    SEARCH = 'search'
    EVENT = 'event'


class Receiver(str, Enum):
    """Email receiver"""

    SELF = 'self'
    PARENT = 'parent'


class Query(BaseModel):
    # pylint: disable=E0213,R0201
    """Search input model"""
    # Freg soek
    birth_date: Optional[date] = Field(None, freg_part='foedsel')
    zip_codes: Optional[List[str]] = Field(None, freg_part='bostedsadresse')
    # Freg uttrekk
    person_status_types: Optional[List[freg_model.Status.PersonStatus]] = Field(
        [freg_model.Status.PersonStatus.RESIDENT]
    )
    marital_status_types: Optional[List[freg_model.MaritalStatusType]] = Field(
        None, freg_part='sivilstand'
    )
    # Freg both
    gender: Optional[freg_model.Gender.InternalGender] = Field(None, freg_part='kjoenn')
    date_of_birth_from: Optional[date] = Field(None, freg_part='foedsel')
    date_of_birth_to: Optional[date] = Field(None, freg_part='foedsel')
    year_of_birth_from: Optional[int] = Field(None, freg_part='foedsel')
    year_of_birth_to: Optional[int] = Field(None, freg_part='foedsel')
    include_residing_address: Optional[bool] = Field(False)
    find_parent: Optional[bool] = Field(False, freg_part='foreldreansvar')

    @validator('year_of_birth_from', always=True)
    def check_date_of_birth_from(cls, value: date, values: dict):
        """Set year_of_birth_from to same year as date_of_birth_from"""
        date_of_birth_from = values.get('date_of_birth_from')
        birth_date = values.get('birth_date')
        if not date_of_birth_from and not birth_date:
            return value
        return date_of_birth_from.year if date_of_birth_from else birth_date.year

    @validator('year_of_birth_to', always=True)
    def check_date_of_birth_to(cls, value: date, values: dict):
        """Set year_of_birth_to to same year as date_of_birth_to"""
        date_of_birth_to = values.get('date_of_birth_to')
        birth_date = values.get('birth_date')
        if not date_of_birth_to and not birth_date:
            return value
        return date_of_birth_to.year if date_of_birth_to else birth_date.year

    def get_needed_parts_for_filter(self):
        # pylint: disable=no-member
        """Return needed freg parts to filter data"""
        return {
            value.field_info.extra.get('freg_part')
            for key, value in self.__fields__.items()
            if getattr(self, key) and value.field_info.extra.get('freg_part')
        }
