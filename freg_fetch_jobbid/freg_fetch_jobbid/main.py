"""Fetch person-info from freg."""
import logging
import os
from typing import Optional
from urllib.parse import urljoin

import google.cloud.logging
import requests
import validators.url

#  from service import create_fetch_uttrekk_message
from cloudevents.http import CloudEvent
from flask import current_app

# from requests_oauthlib import OAuth2
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.request import (
    TilpassetUttrekkJobbRequest,
)
from innbyggerkontakt import digdir, gcp
from otel_setup import instrument_cloud_function
from ps_message.freg_batch_getter import FregBatchGetter
from ps_message.freg_fetch_jobbid import FregFetchJobbid
from pydantic import BaseModel

from freg_fetch_jobbid.service import create_fetch_uttrekk_message


client = google.cloud.logging.Client()
client.setup_logging()


try:
    instrument_cloud_function(current_app)
except RuntimeError:
    logging.warning('Could not instrument otel logging.')


class FetchRequest(BaseModel):
    """Options used to fetch requests."""

    result_bucket: Optional[str]
    organization_id: str
    freg_filter: TilpassetUttrekkJobbRequest


def validated_join(base: str, url: str):
    """Return a joined url and throws ValidationFailure if not valid."""
    joined_url = urljoin(base=base, url=url)
    validators.url(joined_url)
    return joined_url


def maskinporten_well_known_url():
    """Return Maskinportens well-known json url."""
    return validated_join(
        os.getenv('MASKINPORTEN_ENDPOINT', ''), '.well-known/oauth-authorization-server'
    )


def _v1_rolle_url(rolle: str):
    """Return start URL for given `rolle`."""
    return validated_join(
        os.getenv('FIKS_ENDPOINT', ''), f'/folkeregister/api/v1/{rolle}/v1/'
    )


def _get_rolle(organization_id: str) -> str:
    """Get maskinporten role ID."""
    return gcp.get_secret(f'{organization_id}_fiks_role_id')


def _uttrekk_url(rolle: str):
    return validated_join(_v1_rolle_url(rolle), 'uttrekk/tilpasset')


def _get_jobb_id(
    uttrekk_url: str, headers: dict, freg_filter: TilpassetUttrekkJobbRequest
) -> str:
    try:
        jobb_id_request = requests.post(
            url=uttrekk_url,
            headers=headers,
            data=freg_filter.json(by_alias=True, exclude_none=True),
            timeout=600,
        )
        return jobb_id_request.json()['jobbId']
    except KeyError:
        logging.error(
            'Could not find jobbId in the request to freg. Got %s',
            jobb_id_request.json(),
        )
        raise  # Raises in order to retry cloud function.


def start_uttrekk_jobb(
    cloud_event: CloudEvent,
):
    """Fetch persons."""
    message: FregFetchJobbid = FregFetchJobbid.from_cloud_event(cloud_event)
    logging.info('message json: %s', message.json())

    auth_token = digdir.Auth(
        maskinporten_well_known_url(), gcp.get_secret('FIKS_ISSUER'), ['ks:fiks']
    ).get_access_token()
    org_id = message.organization_id
    headers = {
        'IntegrasjonPassord': gcp.get_secret(f'{org_id}_fiks_integration_password'),
        'IntegrasjonId': gcp.get_secret(f'{org_id}_fiks_integration_id'),
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json',
    }
    rolle = _get_rolle(org_id)
    uttrekk_url = _uttrekk_url(rolle=rolle)

    jobb_id = _get_jobb_id(uttrekk_url, headers, freg_filter=message.freg_filter)
    batch_getter_message = FregBatchGetter(
        jobb_id=jobb_id,
        organization_id=org_id,
        batch_number=0,
        bulletin_id=message.bulletin_id,
    )
    create_fetch_uttrekk_message(message_obj=batch_getter_message)
    logging.info(
        'freg_fetch_jobbid finnished and sent message %s',
        batch_getter_message.json(exclude_none=True),
    )
