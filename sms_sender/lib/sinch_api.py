"""Functions for communicating with the Sinch Api."""

import logging
import os

from firebase_admin import exceptions, firestore
from requests import post
from requests.exceptions import Timeout

from lib.get_secrets import get_secrets
from models.sms_model import SMSModel


BATCH_SIZE = 1000


def send_sms(
    sms_model: SMSModel,
):
    """Sends sms in batches. Updates the Firestore document on changes at the end."""
    payload = {
        'from': sms_model.from_name,
        'to': sms_model.to_list,
        'body': sms_model.message,
    }
    url = get_url()
    headers = get_headers()

    document = {
        'updated': firestore.firestore.SERVER_TIMESTAMP,
    }

    db = firestore.firestore.Client()
    doc_ref = db.collection('smsEvent').document(sms_model.message_id)

    # Batch splitting of phone numbers. Split into batches of 1000
    try:
        send_request(
            document=document,
            url=url,
            headers=headers,
            payload=payload,
            doc_ref=doc_ref,
        )
    except AttributeError as e:
        logging.exception('Attribute error during posting of sms to Sinch: %s', e)
    except Timeout as e:
        logging.exception('Timeout during posting of sms to Sinch: %s', e)
        # Raise to make it retry
        document['status'] = 'retry'
        update_firestore_document(doc_ref=doc_ref, document=document)
        raise e


def send_request(
    document: dict,
    url: str,
    headers: dict,
    payload: dict,
    doc_ref: firestore.firestore.DocumentReference,
):
    """Send the request and handles depending on response."""
    response = post(url=url, headers=headers, json=payload, timeout=300)
    data = response.json()

    match response.status_code:
        case status if 199 < status < 299:  # noqa: E0601
            batch_id = data['id']
            batch_size = len(payload['to'])
            document['batch'] = {'batchId': batch_id, 'batchSize': batch_size}
            document['status'] = 'done'
        case status if 399 < status < 429:
            logging.exception('Invalid request: %s', data)
            document['status'] = 'error'
        case status if 499 < status:
            logging.exception('Server error fom api: %s', data)
            document['status'] = 'retry'
            update_firestore_document(doc_ref=doc_ref, document=document)
            return response.raise_for_status()
        case _:
            logging.exception('Unknown status code: %s', data)
            return

    update_firestore_document(doc_ref=doc_ref, document=document)


def update_firestore_document(
    doc_ref: firestore.firestore.DocumentReference, document: dict
):
    """An updater to the messageId document, to keep track of sms process on Firestore."""
    try:
        doc_ref.set(
            document,
            merge=True,
            timeout=300,
        )
    except exceptions.FirebaseError:
        logging.exception('Error when updating firestore document: %s', doc_ref.id)
    except TimeoutError:
        logging.exception('Timeout when updating firestore document: %s', doc_ref.id)
        # Retries to update firestore document
        update_firestore_document(doc_ref, document)


def get_url():
    """Generates the target url for communicating with the api."""
    service_plan_id = get_secrets('SINCH_SERVICE_PLAN_ID')
    region = os.getenv('SINCH_REGION')
    endpoint = os.getenv('SINCH_ENDPOINT')

    if service_plan_id is None:
        raise ValueError('No service plan id found')

    return f'https://{region}.sms.api.sinch.com/xms/v1/{service_plan_id}/{endpoint}'


def get_headers():
    """Generates the headers for communicating with the api."""
    token = get_secrets('SINCH_TOKEN')

    if token is None:
        raise ValueError('No service token found')

    headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}
    return headers


def batch(iterable, n=1, start=0):
    """Creates a list of lists in desired batch sizes. N is the batch size, start is where in the input list to start."""
    length = len(iterable)
    for ndx in range(start, length, n):
        yield iterable[ndx : min(ndx + n, length)]  # noqa: E203
