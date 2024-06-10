"""Adding data to database."""
from pubsub_listener.models.pubsub_model import MessageData, RecipientsData
from sqlalchemy.orm import Session

from models.db.db_models import Message, Recipients


def add_recipients(
    db: Session, bulletin_id: str, pubsub_id: str, recipients_data: RecipientsData
) -> Recipients:
    """Add data from recipients."""
    recipient = Recipients(
        bulletin_id=bulletin_id, pubsub_id=pubsub_id, **recipients_data.dict()
    )
    db.add(recipient)
    db.commit()
    db.refresh(recipient)
    return recipient


def add_message(
    db: Session, bulletin_id: str, pubsub_id: str, message_data: MessageData
) -> Message:
    """Add data from message."""
    message = Message(
        bulletin_id=bulletin_id, pubsub_id=pubsub_id, **message_data.dict()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
