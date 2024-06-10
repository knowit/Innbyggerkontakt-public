"""Organization document from Firestore."""
from pydantic import BaseModel


class OrganizationDocument(BaseModel):
    """Organization document from Firestore as Pydentic base model."""

    shortCode: str
