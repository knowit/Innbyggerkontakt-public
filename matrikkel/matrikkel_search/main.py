"""Responsible for fetching matrikkelenhet ids."""
import functions_framework
from cloudevents.http import CloudEvent
from flask import current_app
from otel_setup import instrument_cloud_function
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent

from libs.bucket_services import (
    store_matrikkel_data_in_bucket,
    store_person_ids_in_bucket,
)
from libs.publish_services import publish_owner_search_message
from libs.service import get_matrikkel_data


instrument_cloud_function(current_app)


@functions_framework.cloud_event
def matrikkel_search(cloud_event: CloudEvent):
    """This function pass the trigger event to the matrikkel_search function."""
    search_event = MatrikkelSearchEvent.from_cloud_event(cloud_event)
    matrikkel_data_list, owner_ids_list = get_matrikkel_data(search_event)
    store_matrikkel_data_in_bucket(search_event, matrikkel_data_list)
    store_person_ids_in_bucket(search_event, owner_ids_list)

    if len(owner_ids_list) > 0:
        publish_owner_search_message(search_event, len(owner_ids_list))

    return 200, 'ok'
