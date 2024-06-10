"""The function that starts the SMS handling system."""
import logging

from cloudevents.http import CloudEvent
from ps_message.sms_event import SMSEvent
from pydantic import ValidationError

from lib.check_event_status import check_event_status, should_proceed
from lib.create_sms_model import create_sms_model
from lib.sinch_api import send_sms
from models.sms_event_document import SmsEventDocument


def sms_handler(event: CloudEvent):
    """The function that starts the SMS handling system."""
    sms_event = 'Invalid pubsub event'
    try:
        sms_event: SMSEvent = SMSEvent.from_cloud_event(event)
    except ValidationError as e:
        logging.error('Pubsub event: %s', event)
        logging.exception('Validation error when creating a pub/sub event: %s', e)
        return
    except KeyError as e:
        logging.error('Pubsub event: %s', event)
        logging.exception('Key error when creating a pub/sub event: %s', e)
        return

    print('Pubsub event: %s', event)

    # Getting sms event document from Firestore to have idempotency
    sms_event_document: SmsEventDocument = check_event_status(sms_event)

    if sms_event_document is None:
        return

    status = sms_event_document.status

    if not should_proceed(status):
        return

    sms_model = create_sms_model(sms_event, sms_event_document.object_path)

    if sms_model is None:
        return
    # The communication function to the Sinch API
    send_sms(sms_model)
