"""Bulletin document model from Firestore."""

from pydantic import BaseModel


class BulletinDocument(BaseModel):
    """Bulletin document from Firestore as Pydentic base model."""

    smsContent: dict[str, str]
    sandboxMode: bool
