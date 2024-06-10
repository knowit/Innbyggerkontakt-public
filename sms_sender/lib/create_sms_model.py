"""Create an instanse of the SMS model."""

import logging

from ps_message.sms_event import SMSEvent

from lib.get_bulletin_message import get_bulletin_message
from lib.get_from_name import get_from_name
from lib.get_phone_numbers import get_phone_numbers
from models.sms_model import SMSModel


def create_sms_model(sms_event: SMSEvent, object_path: str) -> SMSModel:
    """Returns an instance of the SMS model or None."""
    # Getting message from bulletin
    message = get_bulletin_message(sms_event)

    if not message:
        logging.exception(f'Message is none or empty: {message}')  # noqa: W1203
        return None
    # Getting data of whom should receive an sms
    to_list = get_phone_numbers(object_path)

    # Check if valid parse of sms list
    if not to_list:
        logging.exception(  # noqa: W1203
            f'Phone number list is none or empty: {to_list}'
        )
        return None

    # Accessing firestore to retrieve the short code name for a municipality
    from_name = get_from_name(sms_event)

    if from_name is None or from_name.shortCode == '':
        raise ValueError(f'Org_id: {sms_event.organization_id}, has invalid shortCode')

    if message.sandboxMode:
        logging.info('Sandbox mode is on, not sending messages')
        return None

    return SMSModel(
        message_id=sms_event.message_id,
        from_name=from_name.shortCode,
        to_list=to_list,
        message=message.smsContent[sms_event.language],
    )
