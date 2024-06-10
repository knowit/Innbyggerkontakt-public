"""Services for KRR-module."""

import json
import logging
import os
from posixpath import join as urljoin
from typing import List

from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.response import (
    UttrekkDataResponse,
)
from google.cloud import pubsub_v1, storage
from google.cloud.pubsub_v1.publisher.futures import Future
from innbyggerkontakt import gcp
from innbyggerkontakt.digdir.auth import Auth
from innbyggerkontakt.digdir.request import AuthRequest
from krr_models import HentPersonerResponse, PersonResource, Reservasjon, Status
from phone_validator_models.phone_validator_models import Telefonnummer
from pydantic import ValidationError


MAX_KRR_BATCH_SIZE = 1000


def divide_list(in_list: list, k_number: int, batch_size: int = MAX_KRR_BATCH_SIZE):
    """Get the k_number of a batch-size list."""
    _first, _last = k_number * batch_size, (k_number + 1) * batch_size
    return in_list[_first:_last]


def get_nnids_from_bucket(
    org_id: str, bulletin_id: str, jobb_id: str, batch_number: int
) -> UttrekkDataResponse:
    """Get nnids from selected bucket.

    Args:
        org_id (str): organization id.
        bulletin_id (str): bulletin id.
        jobb_id (str): job_id provided by pubsub-message.
        batch (str): batch number provided by pubsub-message

    Returns:
        UttrekkDataResponse: Model with list of nnids.
    """
    bucket_name = os.environ.get('GCP_PROJECT')
    blob_name = f'sms-nids/{org_id}/{bulletin_id}/{jobb_id}/{batch_number}.json'
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    blob = bucket.blob(blob_name=blob_name)
    data = blob.download_as_text()

    UttrekkDataResponse.Config.allow_population_by_field_name = True

    uttrekk_object = UttrekkDataResponse(**json.loads(data))

    return uttrekk_object


def get_persons_from_krr(
    nnids: List[str], organization_id: str
) -> HentPersonerResponse:
    """Get persons from KRR based on list of nnid.

    Args:
        nnids (List[str]): List of nnids.
        organization_id (str): organization id.

    Returns:
        HentPersonerResponse: Model with a list of persons.
    """
    KRR_ENDPOINT = urljoin(os.getenv('KRR_ENDPOINT'), 'rest/v1/personer')
    MASKINPORTEN_CONFIG_URL = urljoin(
        os.getenv('MASKINPORTEN_ENDPOINT'), '.well-known/oauth-authorization-server'
    )
    SCOPES = os.getenv('KRR_SCOPE').split(' ')

    krr_auth = Auth(
        MASKINPORTEN_CONFIG_URL,
        gcp.get_secret('KRR_ISSUER'),
        SCOPES,
        iss_onbehalfof=organization_id,
    )
    krr_request = AuthRequest(krr_auth, not_authorized_status_code=401)

    response = krr_request.request(
        KRR_ENDPOINT,
        data={'personidentifikatorer': nnids},
        headers={'content-type': 'application/json'},
    )

    response.raise_for_status()

    hent_personer_response = HentPersonerResponse(**response.json())

    return hent_personer_response


def normalize_numbers(phone_numbers: List[str]) -> List[str]:
    """Normalize phone numbers with `phone_validator_models`."""
    return [Telefonnummer(number=number).number for number in phone_numbers]


def active_and_valid(person: PersonResource) -> bool:
    """Get filter function that filters active and valid phone numbers."""
    try:
        Telefonnummer(number=person.kontaktinformasjon.mobiltelefonnummer)
    except (ValidationError, AttributeError):
        logging.warning('Could not parse phone # to person:%s', person)
        return False
    return (
        person.status == Status.AKTIV
        and person.reservasjon == Reservasjon.NEI
        and person.kontaktinformasjon.mobiltelefonnummer
    )


def filter_person_phone_numbers(persons: List[PersonResource]) -> List[str]:
    """Get phone numbers to persons that can receive SMS.

    Args:
        persons (List[PersonResource]): List of persons from KRR.

    Returns:
        List[str]: List of phone numbers.
    """
    filtered_persons = [
        p.kontaktinformasjon.mobiltelefonnummer
        for p in persons
        if p.status == Status.AKTIV
        and p.reservasjon == Reservasjon.NEI
        and p.kontaktinformasjon.mobiltelefonnummer
    ]

    return filtered_persons


def upload_phone_numbers_to_storage(
    phone_numbers: List[str],
    org_id: str,
    bulletin_id: str,
    jobb_id: str,
    batch_number: int,
    k_number: int,
) -> str:
    """Upload phone number to GCP-storage.

    Args:
        phone_numbers (List[str]): List of phone numbers.
        org_id (str): org id.
        bulletin_id (str): bulletin id.
        jobb_id (str): jobb-id
        batch (str): current batch.
        k_number (str): k-number.

    Returns:
        str: blob path
    """
    bucket_name = os.environ.get('GCP_PROJECT')
    blob_name = f'sms-phone-numbers/{org_id}/{bulletin_id}/{jobb_id}/{batch_number}_{k_number}.json'

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_string(json.dumps(phone_numbers, default=str))

    return blob.path


def publish_to_pubsub(topic: str, encoded_message: str) -> Future.result:
    """Publish to pubsub topic.

    Args:
        topic (str): the pubsub topic.
        encoded_message (str): utf-8 encoded message.

    Returns:
        _type_: _description_
    """
    project_id = os.environ.get('GCP_PROJECT')
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic)
    future = publisher.publish(topic_path, encoded_message)

    return future.result()
