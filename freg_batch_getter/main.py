"""Fetch person-nid from freg."""
import json
import logging
import os
import time

import functions_framework
import requests
from cloudevents.http import CloudEvent
from flask import current_app
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.response import (
    UttrekkDataResponse,
)
from innbyggerkontakt import digdir, gcp
from otel_setup import instrument_cloud_function
from ps_message.freg_batch_getter import FregBatchGetter
from ps_message.krr_message import KRRMessage

from services import (
    _number_of_pubsubs_to_send,
    collect_batch,
    get_batch_url,
    get_rolle,
    maskinporten_well_known_url,
    publish_to_pubsub,
    upload_batch_to_bucket,
)


try:
    instrument_cloud_function(current_app)
except RuntimeError:
    print('Could not setup instrumentation')

MAX_UTTREKK_BATCH_SIZE = 5000
MAX_KRR_LENGTH = 1000


def _wait_and_call_function_again(cloud_event: CloudEvent, sleep_seconds: str = 2):
    time.sleep(sleep_seconds)
    fetch_batch(cloud_event=cloud_event)


def _handle_200(batch: UttrekkDataResponse, batch_message):
    blob_name = f'sms-nids/{batch_message.organization_id}/{batch_message.bulletin_id}/{batch_message.jobb_id}/{batch_message.batch_number}.json'
    upload_batch_to_bucket(
        bucket_name=os.getenv('GCP_PROJECT'),
        blob_name=blob_name,
        batch_uttrekk=batch,
    )

    batch_length = len(batch.foedsels_eller_d_nummer)
    next_step_topic = os.environ.get('START_KRR_TOPIC')

    for k_number in range(_number_of_pubsubs_to_send(batch_length, MAX_KRR_LENGTH)):
        krr_message = KRRMessage(**batch_message.dict(), k_number=k_number)
        publish_to_pubsub(
            topic=next_step_topic,
            encoded_message=krr_message.encode_for_pubsub(),
        )

    batch_message.batch_number += 1
    if batch_length == MAX_UTTREKK_BATCH_SIZE:
        get_more_batches_topic = os.environ.get('START_BATCH_TOPIC')
        publish_to_pubsub(
            topic=get_more_batches_topic,
            encoded_message=batch_message.encode_for_pubsub(),
        )


def handle_response(
    batch: UttrekkDataResponse,
    batch_message: FregBatchGetter,
    response: requests.Response,
    cloud_event: CloudEvent,
):
    """
    Will act accordingly to what status we get from freg.

    * If 200 we will either get:
        * A full list with `MAX_BATCH_SIZE` of people. -> Get at least one more batch
        * A non-full list. -> No need to get more batches.
        * An empty list. -> Edge-case in case last batch was `== MAX_BATCH_SIZE`
    """
    match response.status_code:
        case 200:
            _handle_200(batch, batch_message)
        case [(404 | 429)]:  # Not done yet or too many calls done, please wait.
            return _wait_and_call_function_again(sleep_secs=2, cloud_event=cloud_event)
        case 400 | 401 | 403 | 410:
            response.raise_for_status()
        case _:
            raise IOError('Something else is wrong')


@functions_framework.cloud_event
def fetch_batch(
    cloud_event: CloudEvent,
):
    """Fetch persons."""
    auth_token = digdir.Auth(
        maskinporten_well_known_url(), gcp.get_secret('FIKS_ISSUER'), ['ks:fiks']
    ).get_access_token()
    try:
        batch_message = FregBatchGetter.from_cloud_event(cloud_event=cloud_event)
    except json.JSONDecodeError:
        logging.error('Could not decode %s', cloud_event)
        return

    headers = {
        'IntegrasjonPassord': gcp.get_secret(
            f'{batch_message.organization_id}_fiks_integration_password'
        ),
        'IntegrasjonId': gcp.get_secret(
            f'{batch_message.organization_id}_fiks_integration_id'
        ),
        'Authorization': f'Bearer {auth_token}',
    }
    rolle = get_rolle(batch_message.organization_id)
    batch_url = get_batch_url(
        rolle=rolle,
        jobb_id=batch_message.jobb_id,
        batch_number=batch_message.batch_number,
    )
    response, batch = collect_batch(batch_url=batch_url, headers=headers)
    handle_response(
        batch=batch,
        response=response,
        batch_message=batch_message,
        cloud_event=cloud_event,
    )
