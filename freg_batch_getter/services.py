"""Services for freg batch getter."""
import datetime
import os
from math import ceil
from urllib.parse import urljoin

import requests
import validators
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.response import (
    UttrekkDataResponse,
)
from google.cloud import pubsub_v1, storage
from innbyggerkontakt import gcp


def upload_batch_to_bucket(
    bucket_name: str, blob_name: str, batch_uttrekk: UttrekkDataResponse
) -> str:
    """Upload batch to bucket."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob.upload_from_string(batch_uttrekk.json())
    return blob.path


def publish_to_pubsub(topic: str, encoded_message: str):
    """Create a pubsub to either start same service again or the next."""
    project_id = os.environ.get('GCP_PROJECT')
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic)
    future = publisher.publish(topic_path, encoded_message)
    return future.result()


def validated_join(base: str, url: str):
    """Return a joined url and throws ValidationFailure if not valid."""
    joined_url = urljoin(base=base, url=url)
    validators.url(joined_url)
    return joined_url


def maskinporten_well_known_url():
    """Return Maskinportens well-known json url."""
    maskinporten_endpoint = os.getenv('MASKINPORTEN_ENDPOINT')
    return validated_join(
        maskinporten_endpoint, '.well-known/oauth-authorization-server'
    )


def v1_rolle_url(rolle: str):
    """Return start URL for given `rolle` from fiks folkeregister."""
    fiks_base_url = os.getenv('FIKS_ENDPOINT')
    return validated_join(fiks_base_url, f'/folkeregister/api/v1/{rolle}/v1/')


def get_rolle(organization_id: str) -> str:
    """Get maskinporten role ID."""
    return gcp.get_secret(f'{organization_id}_fiks_role_id')


def get_batch_url(rolle: str, jobb_id: str, batch_number: int = 0) -> str:
    """Validate and return batch_url from fiks folkeregister."""
    return validated_join(
        v1_rolle_url(rolle), f'uttrekk/{jobb_id}/batch/{batch_number}'
    )


def collect_batch(batch_url, headers) -> tuple[requests.Response, UttrekkDataResponse]:
    """Collect batch from folkeregisteret -> uttrekk."""
    response = requests.get(batch_url, headers=headers)
    now = datetime.datetime.now().strftime('%H:%M:%S.%f')
    print(f'{now} - {batch_url} - {response.status_code}')
    return response, UttrekkDataResponse(**response.json())


def _number_of_pubsubs_to_send(big_batch_size, small_batch_size):
    return ceil(big_batch_size / small_batch_size)
