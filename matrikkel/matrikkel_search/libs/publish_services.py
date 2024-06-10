"""This file includes functions for publishing messages to topics."""
import os
from math import ceil

from google.cloud.pubsub_v1 import PublisherClient
from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent


publisher = PublisherClient()
owner_search_topic = publisher.topic_path(
    os.getenv('GCP_PROJECT', ''), os.getenv('MATRIKKEL_OWNER_SEARCH_TOPIC', '')
)

BATCH_SIZE = 1000


def publish_owner_search_message(search_event: MatrikkelSearchEvent, size: int):
    """Publishes the message to the owner search topic."""
    owner_search_message = MatrikkelOwnerSearchEvent(
        current_batch=0,
        total_batches=ceil(size / BATCH_SIZE),
        bulletin_id=search_event.bulletin_id,
        organization_id=search_event.organization_id,
        municipality_number=search_event.municipality_number,
        filter_id=search_event.filter_id,
    )

    publisher.publish(
        owner_search_topic,
        data=owner_search_message.encode_for_pubsub(),
    )
