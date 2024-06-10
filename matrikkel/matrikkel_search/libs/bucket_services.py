"""Stores the matrikkel data in the bucket for the bulletin."""
import json
import os
from typing import Dict, List

import msgspec
from google.cloud.storage import Client
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent


storage_client = Client()
bucket_name = os.getenv('GCP_PROJECT')
bucket = storage_client.bucket(bucket_name)


class MatrikkelEnhet(msgspec.Struct):
    """MatrikkelEnhet struct."""

    id: str
    owners: List[str]


# TODO: her burde vi brukt samme modeller på tvers.
class MatrikkelData(msgspec.Struct):
    """MatrikkelData struct."""

    matrikkel_enheter_list: List[MatrikkelEnhet]


def store_matrikkel_data_in_bucket(
    search_event: MatrikkelSearchEvent, matrikkel_ids: List
):
    """Stores the matrikkelenhet ids in the bucket for the bulletin."""
    blob_name = f'matrikkel/bulletin_data/{search_event.organization_id}/{search_event.bulletin_id}/{search_event.filter_id}/matrikkel_enhet_ids.json'
    bucket.blob(blob_name).upload_from_string(data=json.dumps(matrikkel_ids))
    return blob_name


def store_person_ids_in_bucket(search_event: MatrikkelSearchEvent, person_ids: List):
    """Stores the person ids in the bucket for the bulletin."""
    blob_name = f'matrikkel/bulletin_data/{search_event.organization_id}/{search_event.bulletin_id}/{search_event.filter_id}/person_ids.json'
    bucket.blob(blob_name).upload_from_string(data=json.dumps(person_ids))
    return blob_name


def get_matrikkel_enhets_data_from_bucket(
    search_event: MatrikkelSearchEvent,
) -> Dict[str, List[str]]:
    """Gets the matrikkelenhet ids from the bucket for the bulletin.

    Args:
        search_event (MatrikkelSearchEvent): Matrikkel search event

    Returns:
        Dict[str, List[str]]: Dict with matrikkel-id mapped to owners.
    """
    blob_name = f'matrikkel/matrikkel_copy/{search_event.municipality_number}/matrikkel_enheter.json'
    blob = bucket.blob(blob_name)
    bytes_data = blob.download_as_bytes()

    data = msgspec.json.decode(bytes_data, type=MatrikkelData)
    return _data_array_to_map(data)


def _data_array_to_map(matrikkel_data: MatrikkelData) -> Dict[str, List[str]]:
    mapped_data = {}

    for d in matrikkel_data.matrikkel_enheter_list:
        mapped_data[d.id] = d.owners

    return mapped_data
