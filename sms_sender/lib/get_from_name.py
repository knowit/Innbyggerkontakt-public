"""This file includes a function to retrieve the name that should be displayed as sender in the sms."""
import logging

from firebase_admin import exceptions, firestore
from ps_message.sms_event import SMSEvent

from models.organization_document import OrganizationDocument


def get_from_name(sms_event: SMSEvent):
    """Function retrieves a Firestore document containing the name of the organization."""
    try:
        db = firestore.firestore.Client()
        doc_ref = db.collection('organization').document(sms_event.organization_id)
        doc = doc_ref.get()

        if doc.exists:
            doc = doc.to_dict()
            return OrganizationDocument(**doc)
    except (exceptions.FirebaseError, AttributeError) as e:
        logging.exception('Error when getting organizatino name: %s', e)
        return
