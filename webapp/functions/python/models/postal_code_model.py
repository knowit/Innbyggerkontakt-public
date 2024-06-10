"""Postal data models"""
from pydantic import BaseModel, Field


class PostalCodeElement(BaseModel):
    """Postal data element structure"""
    postal_code: str = Field(alias='postalCode')
    postal_area: str = Field(alias='postalArea')
    municipality_number: str = Field(alias='municipalityNumber')
    municipality_name: str = Field(alias='municipalityName')
    category: str = Field(alias='category')
