"""Function for getting the current document on the pub/sub event on Firestore."""
import logging

from firebase_admin import exceptions, firestore
from ps_message.sms_event import SMSEvent

from models.sms_event_document import SmsEventDocument


def check_event_status(sms_event: SMSEvent):
    """Function retrieves or creates a Firestore document for the current pub/sub event."""
    object_path = f'sms-phone-numbers/{sms_event.organization_id}/{sms_event.bulletin_id}/{sms_event.jobb_id}/{sms_event.batch_number}_{sms_event.k_number}.json'
    try:
        db = firestore.firestore.Client()
        doc_ref = db.collection('smsEvent').document(sms_event.message_id)
        doc = doc_ref.get()

        if doc.exists:
            doc = doc.to_dict()
            valid_document = SmsEventDocument(**doc)

            if valid_document.status == 'retry':
                # Setting the state of the event to pending
                doc_ref.set(
                    {'status': 'pending', 'updated': firestore.SERVER_TIMESTAMP},
                    merge=True,
                )

            return valid_document
        else:
            document = {
                'status': 'pending',
                'created': firestore.SERVER_TIMESTAMP,
                'updated': firestore.SERVER_TIMESTAMP,
                'objectPath': object_path,
                'bulletinId': sms_event.bulletin_id,
                'orgId': sms_event.organization_id,
            }
            doc_ref.set(document)
            return SmsEventDocument(
                status='new',
                object_path=object_path,
                bulletin_id=sms_event.bulletin_id,
                org_id=sms_event.organization_id,
            )
    except (exceptions.FirebaseError, AttributeError) as e:
        logging.exception('Error when checking event status: %s', e)
        return


def should_proceed(status: str):
    """Checks if the status is not valid for proceeding with sms sending."""
    match status:
        case 'pending':
            logging.error('SMS event already in progress')
            return False
        case 'done':
            logging.error('SMS event already done')
            return False
        case 'error':
            logging.error('SMS event in error state')
            return False
        case 'retry':
            return True
        case 'new':
            return True
        case _:
            logging.error('Invalid status: %s', status)
            return False
