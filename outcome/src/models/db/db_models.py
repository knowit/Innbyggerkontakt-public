# pylint: disable=C0115,C0116,R0903,no-self-use
"""Database models."""
from enum import Enum

from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy_utils import aggregated


class Bulletin(Base):
    """
    Bulletin database model.

    Attributes:
        freg_total_hits: Get total hits on all Recipients.
        not_reserved: Get total recipients that are *not* reserved.
        reserved: Get total recipients that are reserved.
        not_active: Get total messages that are ?not active?.
        deleted: "Get total messages that are ?deleted?.
        mails_sent: Get total number of messages sent.
    """

    __table_args__ = {'schema': 'innbyggerkontakt_outcome'}
    __tablename__ = 'bulletin'
    bulletin_id = Column(String, primary_key=True)
    organization_id = Column(String, nullable=False)
    datetime_created = Column(DateTime(timezone=True), default=func.now())
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    recipients_sum = relationship('Recipients')
    message_sum = relationship('Message')

    @aggregated('recipients_sum', Column(Integer))
    def freg_total_hits(self):
        """Get total hits on all Recipients."""
        return func.coalesce(func.sum(Recipients.hits), 0)

    @aggregated('message_sum', Column(Integer))
    def not_reserved(self):
        """Get total recipients that are *not* reserved."""
        return func.coalesce(func.sum(Message.not_reserved), 0)

    @aggregated('message_sum', Column(Integer))
    def reserved(self):
        """Get total recipients that are reserved."""
        return func.coalesce(func.sum(Message.reserved), 0)

    @aggregated('message_sum', Column(Integer))
    def not_active(self):
        """Get total messages that are ?not active?."""
        return func.coalesce(func.sum(Message.not_active), 0)

    @aggregated('message_sum', Column(Integer))
    def deleted(self):
        """Get total messages that are ?deleted?."""
        return func.coalesce(func.sum(Message.deleted), 0)

    @aggregated('message_sum', Column(Integer))
    def mails_sent(self):
        """Get total number of messages sent."""
        return func.coalesce(func.sum(Message.mails_sent), 0)


class Message(Base):
    """Message as it is stored in `message` table in `innbyggerkontakt_outcome` schema."""

    __table_args__ = {'schema': 'innbyggerkontakt_outcome'}
    __tablename__ = 'message'
    id = Column(Integer, primary_key=True, autoincrement=True)
    bulletin_id = Column(String, ForeignKey(Bulletin.bulletin_id), nullable=False)
    not_reserved = Column(Integer)
    reserved = Column(Integer)
    not_active = Column(Integer)
    deleted = Column(Integer)
    mails_sent = Column(Integer)
    datetime_created = Column(DateTime(timezone=True), default=func.now())
    pubsub_id = Column(String, unique=True, nullable=False)

    bulletin = relationship(Bulletin)


class Recipients(Base):
    """Recipients as it is stored in `recipients` table in `innbyggerkontakt_outcome` schema."""

    __table_args__ = {'schema': 'innbyggerkontakt_outcome'}
    __tablename__ = 'recipients'
    id = Column(Integer, primary_key=True, autoincrement=True)
    bulletin_id = Column(String, ForeignKey(Bulletin.bulletin_id), nullable=False)
    hits = Column(Integer)
    datetime_created = Column(DateTime(timezone=True), default=func.now())
    pubsub_id = Column(String, unique=True, nullable=False)

    bulletin = relationship(Bulletin)


class OrderBy(str, Enum):
    """OrderBy enum."""

    BULLETIN_ID = 'bulletin_id'
    DATETIME_CREATED = 'datetime_created'
    LAST_UPDATED = 'last_updated'
    FREG_TOTAL_HITS = 'freg_total_hits'
    NOT_RESERVED = 'not_reserved'
    RESERVED = 'reserved'
    NOT_ACTIVE = 'not_active'
    DELETED = 'deleted'
    MAILS_SENT = 'mails_sent'


class OrderDirection(str, Enum):
    """OrderDirection enum."""

    ASC = 'asc'
    DESC = 'desc'
