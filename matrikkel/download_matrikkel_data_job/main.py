"""Get phone numbers from KRR."""
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


@retry(max_age_ms=60_000)
@functions_framework.cloud_event
def download_matrikkel_data_job(cloud_event: CloudEvent):
    """Download matrikkel data for every municipality number in firestore.

    Args:
        cloud_event (CloudEvent): cloud event
    """
    print(f'download matrikkel data job triggered with cloud event: {cloud_event}')

    municipality_numbers = services.download_municipality_numbers()

    download_matrikkel_data_topic = os.environ.get(
        'DOWNLOAD_MATRIKKEL_DATA_BATCH_TOPIC'
    )

    for n in municipality_numbers:
        message_to_publish = MatrikkelDownloadMessage(
            batch_number=0, from_matrikkel_id=0, municipality_number=n
        )  # type: ignore
        services.publish_to_pubsub(
            topic=download_matrikkel_data_topic,
            encoded_message=message_to_publish.encode_for_pubsub(),
        )
