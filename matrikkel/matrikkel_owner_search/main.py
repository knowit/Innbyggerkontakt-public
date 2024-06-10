"""This file includes the entry point for the matrikkel owner search module."""
import time

import functions_framework
from cloudevents.http import CloudEvent
from flask import current_app
from otel_setup import instrument_cloud_function
from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)

from libs.bucket_services import upload_data_to_bucket
from libs.person_services import get_person_data
from libs.publish_services import publish_messages


instrument_cloud_function(current_app)


@functions_framework.cloud_event
def matrikkel_owner_search(cloud_event: CloudEvent):
    """This function handles the cloud event from PubSub and searches for the owners national ID. It is the entry point."""
    now = time.time()
    owner_search_event = MatrikkelOwnerSearchEvent.from_cloud_event(cloud_event)
    person_data = get_person_data(owner_search_event)
    hits_and_path_data = upload_data_to_bucket(owner_search_event, person_data)
    publish_messages(owner_search_event, hits_and_path_data)
    print(
        f'Function total runtime without publishing to the message module: {time.time() - now}'
    )
    return 200, 'ok'
