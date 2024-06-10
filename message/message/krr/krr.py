"""Integration against KRR."""
import os
from posixpath import join as urljoin
from typing import List

from innbyggerkontakt.common.utils import divide_list
from innbyggerkontakt.digdir.auth import Auth
from innbyggerkontakt.digdir.request import AuthRequest
from innbyggerkontakt.gcp.utils import get_secret
from innbyggerkontakt.models.person_list import PersonList

from models.krr import KrrPerson


CHUNK_SIZE = 1000
KRR_ENDPOINT = urljoin(os.getenv('KRR_ENDPOINT'), 'rest/v1/personer')
MASKINPORTEN_CONFIG_URL = urljoin(
    os.getenv('MASKINPORTEN_ENDPOINT'), '.well-known/oauth-authorization-server'
)
SCOPES = os.getenv('KRR_SCOPE').split(' ')


class KrrNotAuthorizedError(Exception):
    """Krr not authorized error."""

    def __init__(self, response, message='User not authorized with response: {}'):
        super().__init__(message.format(response))


def get_krr_persons(
    personidentifikatorer: List[str], default_language: str, organization_id: str
) -> PersonList:
    """
    Get contact info from krr.

    Args:
        personidentifikatorer: List over nnid.
        default_language: E.g nb, nn, en.
        organization_id: The orgid.

    Returns:
        A PersonList with persons of Type Krr example:

        PersonList(persons=[KrrPerson(personidentifikator: "12345678901, ..."), ...])
    """

    krr_auth = Auth(
        MASKINPORTEN_CONFIG_URL,
        get_secret('KRR_ISSUER'),
        SCOPES,
        iss_onbehalfof=organization_id,
    )
    krr_request = AuthRequest(krr_auth, not_authorized_status_code=401)
    person_list = PersonList(persons=[])
    for batch in divide_list(personidentifikatorer, CHUNK_SIZE):
        response = krr_request.request(
            KRR_ENDPOINT,
            data={'personidentifikatorer': batch},
            headers={'content-type': 'application/json'},
        )
        if response.status_code != 200:
            raise KrrNotAuthorizedError(response.status_code)
        _chunk_persons = [
            KrrPerson(default_language=default_language, **person)
            for person in response.json()['personer']
        ]
        person_list.persons.extend(_chunk_persons)

    return person_list
