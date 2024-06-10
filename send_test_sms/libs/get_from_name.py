"""This file includes a function to retrieve the name that should be displayed as sender in the sms."""
import logging

from firebase_admin import exceptions, firestore

from models.organization_document import OrganizationDocument


def get_from_name(organization_id: str) -> str | None:
    """Function returns a string from a Firebase document containing the name of the organization."""
    try:
        db = firestore.firestore.Client()
        doc_ref = db.collection('organization').document(organization_id)
        doc = doc_ref.get()

        if doc.exists:
            doc = doc.to_dict()
            return OrganizationDocument(**doc).shortCode
    except (exceptions.FirebaseError, AttributeError) as e:
        logging.exception('Error when getting organization name: %s', e)
        return
