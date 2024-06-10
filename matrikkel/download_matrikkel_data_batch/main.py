"""Get phone numbers from KRR."""
import json
import logging
import os

import functions_framework
from cloudevents.http import CloudEvent
from flask import current_app
from otel_setup import instrument_cloud_function
from ps_message.matrikkel_download_message import MatrikkelDownloadMessage
from retry_helper.main import retry

import services


try:
    instrument_cloud_function(current_app)
except RuntimeError:
    logging.warning('Could not instrument cloud function')


@retry(max_age_ms=600_000)
@functions_framework.cloud_event
def download_matrikkel_data_batch_for_organization(cloud_event: CloudEvent):
    """Download matrikkel units and owners and upload to storage bucket.

    Args:
        cloud_event (CloudEvent): CloudEvent model.
    """
    try:
        recieved_message: MatrikkelDownloadMessage = (
            MatrikkelDownloadMessage.from_cloud_event(cloud_event)
        )
    except json.JSONDecodeError:
        logging.error('Could not decode %s', cloud_event)
        return

    municipality_number = recieved_message.municipality_number
    from_matrikkel_id = recieved_message.from_matrikkel_id
    batch_number = recieved_message.batch_number

    matrikkel_element_tree = services.request_matrikkel_enheter_batch_element_tree(
        municipality_number=municipality_number, from_matrikkel_id=from_matrikkel_id
    )
    largest_id, number_of_ids = services.largest_id_and_length(matrikkel_element_tree)
    elements_with_owners = services.get_matrikkel_units_with_person_owners(
        matrikkel_element_tree
    )
    matrikkel_enheter = services.create_matrikkel_enheter_list(elements_with_owners)

    if matrikkel_enheter.matrikkel_enheter_list:
        print(
            f'Found {len(matrikkel_enheter.matrikkel_enheter_list)} matrikkel enheter with owners for message {recieved_message}'
        )
        services.update_matrikkel_data_in_storage(
            matrikkel_enheter, municipality_number, batch_number
        )
    else:
        print(
            f'Could not find any matrikkel enheter with owners for {recieved_message}.'
        )
    if number_of_ids == 5000 and largest_id:
        # download next batch
        get_more_batches_topic = os.environ.get('DOWNLOAD_MATRIKKEL_DATA_BATCH_TOPIC')
        message_to_publish = MatrikkelDownloadMessage(**recieved_message.dict())
        message_to_publish.batch_number = batch_number + 1
        message_to_publish.from_matrikkel_id = largest_id
        services.publish_to_pubsub(
            topic=get_more_batches_topic,
            encoded_message=message_to_publish.encode_for_pubsub(),
        )
