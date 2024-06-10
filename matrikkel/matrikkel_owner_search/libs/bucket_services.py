"""This file includes validation classes for fast JSON validation and parsing. Further, it has functions for downloading and uploading data to Google Cloud Storage."""
import json
import os
from datetime import datetime
from typing import List

import msgspec
from google.cloud.storage import Client
from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)
from pytz import timezone


storage_client = Client()
bucket_name = os.getenv('GCP_PROJECT')
bucket = storage_client.bucket(bucket_name)


def get_data_from_bucket(owner_search_event: MatrikkelOwnerSearchEvent) -> List[str]:
    """This function downloads the peron ids from a municipality, and the polygon search's desired matrikkelenhet ID's from Google Cloud Storage.

    After processing the data, the function creates matrikkelenhet objects including the owner IDs.
    """
    blob_name = f'matrikkel/bulletin_data/{owner_search_event.organization_id}/{owner_search_event.bulletin_id}/{owner_search_event.filter_id}/person_ids.json'
    blob = bucket.blob(blob_name)
    bytes_data = blob.download_as_bytes()

    person_ids = msgspec.json.decode(bytes_data, type=List[str])
    return person_ids


def upload_data_to_bucket(owner_search_event: MatrikkelOwnerSearchEvent, persons: List):
    """The function uploads data to the matrikkel bucket in Google Cloud Storage. Data included are metadata and a list of peoples' national ID."""
    path = f'matrikkel/recipients/{owner_search_event.organization_id}/{owner_search_event.bulletin_id}/{owner_search_event.filter_id}/'
    hits = len(persons)

    _upload_metadata(owner_search_event, path, hits)
    _upload_persons(owner_search_event, path, persons)

    return {'hits': hits, 'path': path}


def _upload_metadata(
    owner_search_event: MatrikkelOwnerSearchEvent, path: str, hits: int
):
    blob_name = path + 'metadata.json'
    t_z = timezone('Europe/Oslo')
    metadata = {
        'query_date': t_z.localize(datetime.now()).isoformat(),
        'hits': hits,
    }

    print(f'Number of hits: {hits}')

    if owner_search_event.current_batch > 0:
        # !Persist current metadata
        blob = bucket.blob(blob_name)
        string = blob.download_as_string()
        old_meta_data = json.loads(string)
        metadata['hits'] += old_meta_data['hits']

        print(f'Number of total hits: {metadata["hits"]}')

    bucket.blob(blob_name).upload_from_string(json.dumps(metadata, default=str))
    return blob_name


def _upload_persons(
    owner_search_event: MatrikkelOwnerSearchEvent, path: str, persons: List[dict]
):
    blob_name = path + f'{owner_search_event.current_batch}.json'
    bucket.blob(blob_name).upload_from_string(data=json.dumps(persons))
    return blob_name
