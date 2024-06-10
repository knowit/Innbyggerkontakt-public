"""Get phone numbers from KRR."""

import logging
import os

import functions_framework
from cloudevents.http import CloudEvent
from flask import current_app
from krr_models import PersonResource
from otel_setup import instrument_cloud_function
from ps_message.krr_message import KRRMessage
from ps_message.sms_event import SMSEvent

import services


try:
    instrument_cloud_function(current_app)
except RuntimeError:
    logging.warning('Could not instrument cloud function')


@functions_framework.cloud_event
def get_phone_numbers_from_krr(cloud_event: CloudEvent):
    """Get phone numbers from krr, upload to bucket and publish to pubsub.

    Args:
        cloud_event (CloudEvent): CloudEvent model.
    """
    krr_message: KRRMessage = KRRMessage.from_cloud_event(cloud_event)

    uttrekk = services.get_nnids_from_bucket(
        org_id=krr_message.organization_id,
        bulletin_id=krr_message.bulletin_id,
        jobb_id=krr_message.jobb_id,
        batch_number=krr_message.batch_number,
    )

    nnids_batch = services.divide_list(
        uttrekk.foedsels_eller_d_nummer, int(krr_message.k_number)
    )

    persons_response = services.get_persons_from_krr(
        nnids_batch, krr_message.organization_id
    )

    _ps: list[PersonResource] = filter(
        services.active_and_valid, persons_response.personer
    )
    phone_numbers = [p.kontaktinformasjon.mobiltelefonnummer for p in _ps]
    phone_numbers = services.normalize_numbers(phone_numbers)

    if phone_numbers:
        services.upload_phone_numbers_to_storage(
            phone_numbers=phone_numbers,
            org_id=krr_message.organization_id,
            bulletin_id=krr_message.bulletin_id,
            jobb_id=krr_message.jobb_id,
            batch_number=krr_message.batch_number,
            k_number=krr_message.k_number,
        )

        sms_event = SMSEvent(**krr_message.dict())
        services.publish_to_pubsub(
            os.environ.get('PROCESS_PHONE_NUMBERS_TOPIC'),
            sms_event.encode_for_pubsub(),
        )
    else:
        print(
            f'Found no phone numbers in JOB: {krr_message.jobb_id}, BATCH: {krr_message.batch_number}, K_NUMBER: {krr_message.k_number}'
        )
