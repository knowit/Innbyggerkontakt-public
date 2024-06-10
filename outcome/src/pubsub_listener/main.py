"""Pubsub listener main."""
from database import SessionLocal
from pubsub_listener.models.pubsub_model import MessageData, Pubsub, RecipientsData
from pubsub_listener.repository import bulletin_repository, pubsub_repository


db = SessionLocal()


def outcome_pubsub_listener(event, context):
    """Store pubsub messages."""
    event = Pubsub(**event, pubsub_id=context.event_id)
    bulletin_repository.exist_or_register_bulletin(
        db, **event.attributes.dict(exclude={'type'})
    )
    response = None
    if isinstance(event.data, RecipientsData):
        response = pubsub_repository.add_recipients(
            db, event.attributes.bulletin_id, event.pubsub_id, event.data
        )
    if isinstance(event.data, MessageData):
        response = pubsub_repository.add_message(
            db, event.attributes.bulletin_id, event.pubsub_id, event.data
        )

    return response
