"""In this file, the purpose of the functions is to publish messages to PubSub."""
import json
import os
from typing import Dict, Union

from google.cloud.pubsub_v1 import PublisherClient
from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)


publisher = PublisherClient()
recipients_topic = publisher.topic_path(
    os.getenv('GCP_PROJECT', ''), os.getenv('RECIPIENTS_STATUS_TOPIC', '')
)
outcome_topic = publisher.topic_path(
    os.getenv('GCP_PROJECT', ''), os.getenv('OUTCOME_TOPIC', '')
)
recursive_topic = publisher.topic_path(
    os.getenv('GCP_PROJECT', ''), os.getenv('MATRIKKEL_OWNER_SEARCH_TOPIC', '')
)


def publish_messages(
    owner_search_event: MatrikkelOwnerSearchEvent,
    hits_and_path_data: Dict[str, Union[str, int]],
):
    """This is the main function to publish messages to recipients status topic and the outcome topic."""
    next_batch = owner_search_event.current_batch + 1

    if next_batch < owner_search_event.total_batches:
        _publish_to_recursive_topic(owner_search_event, next_batch)
    else:
        _publish_to_recipients_status_topic(owner_search_event, hits_and_path_data)
        _publish_to_outcome_topic(owner_search_event, int(hits_and_path_data['hits']))


def _publish_to_recipients_status_topic(
    owner_search_event: MatrikkelOwnerSearchEvent, data: Dict[str, Union[str, int]]
):
    publisher.publish(
        recipients_topic,
        data=json.dumps(data).encode('utf-8'),
        bulletin_id=owner_search_event.bulletin_id,
        organization_id=owner_search_event.organization_id,
        trace_string='',  # ? Why do we have this?
        bulletin_type='search',
    )


def _publish_to_outcome_topic(owner_search_event: MatrikkelOwnerSearchEvent, hits: int):
    publisher.publish(
        outcome_topic,
        data=json.dumps({'hits': hits}).encode('utf-8'),
        bulletin_id=owner_search_event.bulletin_id,
        organization_id=owner_search_event.organization_id,
        trace_string='',  # ? Why do we have this?
        type='recipients',
    )


def _publish_to_recursive_topic(
    owner_search_event: MatrikkelOwnerSearchEvent, next_batch: int
):
    owner_search_event.current_batch = next_batch

    publisher.publish(
        recursive_topic,
        data=owner_search_event.encode_for_pubsub(),  # type: ignore
    )
