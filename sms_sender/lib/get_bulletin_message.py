"""This file includes a function to retrieve the name that should be displayed as sender in the sms."""
import logging

from firebase_admin import exceptions, firestore
from ps_message.sms_event import SMSEvent

from models.bulletin_document import BulletinDocument


def get_bulletin_message(sms_event: SMSEvent):
    """Function retrieves or creates a Firestore document for the current pub/sub event."""
    try:
        db = firestore.firestore.Client()
        doc_ref = (
            db.collection('organization')
            .document(sms_event.organization_id)
            .collection('bulletin')
            .document('finished')
            .collection('default')
            .document(sms_event.bulletin_id)
        )

        doc = doc_ref.get()

        if doc.exists:
            doc = doc.to_dict()
            return BulletinDocument(**doc)
        else:
            logging.warning("Bulletin document doesn't exist")
    except (exceptions.FirebaseError, AttributeError) as e:
        logging.exception('Error when getting bulletin: %s', e)
