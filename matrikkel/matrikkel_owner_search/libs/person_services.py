"""This is a service for fetching all the data needed for querying the matrikkel API."""
from typing import Dict, List

from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)
from suds.client import Client

from libs.bucket_services import get_data_from_bucket
from libs.store_service.context import get_client_matrikkel_context
from libs.store_service.store_service_client import get_store_service_client
from models.person_model import Person


BATCH_SIZE = 1000


def get_person_data(owner_search_event: MatrikkelOwnerSearchEvent):
    """get_person_data: The function for fetching first name and national id numbers.

    Args:
        pubsub_model (PubSubModel): The pubsub model recieved as a cloud event.

    Returns:
        _type_: A list of person data as dicts. Includes two keys: freg_identifier and name.
    """
    # ? Getting SOAP client
    store_service_client = get_store_service_client()
    context = get_client_matrikkel_context(store_service_client)

    # ? Fetching data from bucket and process it
    person_ids = get_data_from_bucket(owner_search_event)

    # ? Creating a search object
    mbId_list = store_service_client.factory.create('ns0:MatrikkelBubbleIdList')

    # ? Creating correct index of list
    start_index = owner_search_event.current_batch * BATCH_SIZE
    end_index = (
        start_index + BATCH_SIZE
        if owner_search_event.current_batch + 1 < owner_search_event.total_batches
        else len(person_ids)
    )

    print(f'Iterating from index {start_index} to {end_index}')

    item = _create_person_ids_objects(
        store_service_client, person_ids[start_index:end_index]
    )  # get a batch of 1000 person ids or rest

    mbId_list.item = item

    # ? Fetching objects from matrikkel
    result = store_service_client.service.getObjects(mbId_list, context)

    return _parse_result_objects(result)


def _create_person_ids_objects(
    store_service_client: Client, person_ids: List[str]
) -> List:
    result = []

    for p in person_ids:
        pId = store_service_client.factory.create('ns32:PersonId')
        pId.value = p
        result.append(pId)

    return result


def _parse_result_objects(result) -> List[Dict[str, str]]:
    persons_data: List[Dict[str, str]] = []

    num_of_no_nids = 0

    for e in result.item:
        try:
            persons_data.append(Person(freg_identifier=e.nummer, name=e.fornavn).dict())
        except AttributeError:
            num_of_no_nids += 1
            continue

    print(f'Num of persons with no nids: {num_of_no_nids}')

    return persons_data
