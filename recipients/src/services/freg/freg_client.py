"""
Freg client.

Exports
-------
FregClient(organization_id)
    A client used to make requests and fetch data from freg
"""
import time
from typing import List, Set
from urllib.error import HTTPError

from innbyggerkontakt import common, digdir, gcp

import freg_config
from models import event_model, freg_model


class FregClient:
    """
    A client used to make requests and fetch data from freg.

    Methods
    -------
    get_person_info(person_identifiers: List[str], parts: List[str])
        Get data for persons in freg
    extract(query: dict)
        Search freg for query
    get_feed(sequence)
        Get event feed from freg
    get_last_feed_sequence()
        Get last event sequence number from freg
    """

    def __init__(self, organization_id):
        """
        __init__.

        Parameters
        ----------
        organization_id: str
            The organization making the request
        """
        auth = digdir.Auth(
            freg_config.MASKINPORTEN_CONFIG_URL,
            gcp.get_secret('FIKS_ISSUER'),
            freg_config.scopes,
        )
        self.__auth_requests = digdir.AuthRequest(auth)
        self.__headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'IntegrasjonPassord': gcp.get_secret(
                f'{organization_id}_fiks_integration_password'
            ),
            'IntegrasjonId': gcp.get_secret(f'{organization_id}_fiks_integration_id'),
        }
        self.__role_id = gcp.get_secret(f'{organization_id}_fiks_role_id')

    def __fetch_batch(self, url: str) -> digdir.request.requests.Request:
        """
        Make request to freg and wait if the batch is not ready.

        Return `requests.Request`
        """
        for attempt in range(50):
            response = self.__auth_requests.request_get(url, headers=self.__headers)
            if response.status_code == 200:
                return response

            time.sleep(2 + attempt)

        response.raise_for_status()
        return response

    def __get_extraction(self, freg_job_id: str) -> List[str]:
        """Return List of personidentifikatorer from freg."""
        time.sleep(2)  # Wait for batch to be ready
        batch_counter = 0
        response = self.__fetch_batch(
            freg_config.UTTREKK_BATCH_URL.format(
                self.__role_id, freg_job_id, batch_counter
            )
        )
        person_identifikator = []
        person_identifikator_batch = response.json().get('foedselsEllerDNummer', [])
        while len(person_identifikator_batch) > 0:
            person_identifikator.extend(person_identifikator_batch)
            batch_counter += 1
            time.sleep(2)
            response = self.__fetch_batch(
                freg_config.UTTREKK_BATCH_URL.format(
                    self.__role_id, freg_job_id, batch_counter
                )
            )
            person_identifikator_batch = response.json().get('foedselsEllerDNummer', [])
        return person_identifikator

    def get_person_info(
        self, person_identifiers: List[str], parts: Set[str]
    ) -> List[freg_model.Person]:
        """
        Get data for persons in freg.

        Parameters
        ----------
        person_identifiers: List[str]
            List of freg identifiers
        parts: List[str]
            A list of parts to fetch for persons

        Returns
        -------
        List[freg_model.Person]
            A list of persons with specified parts from freg
        """
        persons = []
        for batch in common.divide_list(
            person_identifiers, freg_config.MAX_POST_REQUEST_SIZE
        ):
            body = {'foedselsEllerDNummer': batch}
            params = {'part': parts}
            response = self.__auth_requests.request_post(
                freg_config.BULKOPPSLAG_URL.format(self.__role_id),
                json=body,
                headers=self.__headers,
                params=params,
            )
            my_raise_for_status(response)
            freg_persons = freg_model.Lookup(**response.json()).lookup
            persons.extend(freg_persons)
        return persons

    def extract(self, query: dict) -> List[str]:
        """
        Search freg for query.

        Parameters
        ----------
        query: dict
            Query used as body for request

        Returns
        -------
        List[str]
            A list of freg identifiers
        """
        response = self.__auth_requests.request_post(
            freg_config.UTTREKK_URL.format(self.__role_id),
            json=query,
            headers=self.__headers,
        )
        response.raise_for_status()
        return self.__get_extraction(response.json()['jobbId'])

    def get_feed(self, sequence: int) -> List[event_model.EventWrapper]:
        """
        Get event feed from freg.

        Parameters
        ----------
        sequence: int
            Get events from sequence number

        Returns
        -------
        List[event_model.EventWrapper]
            List of events from freg, length depends on response from freg
        """
        response = self.__auth_requests.request(
            freg_config.HENDELSER_FEED.format(self.__role_id),
            headers=self.__headers,
            params={'seq': sequence},
        )
        my_raise_for_status(response)

        return [event_model.EventWrapper(**event) for event in response.json()]

    def get_last_feed_sequence(self):
        """
        Get last event sequence number from freg.

        Returns
        -------
        int
            Last event sequence number from freg
        """
        response = self.__auth_requests.request(
            freg_config.HENDELSER_SISTE_SEKVENSNUMMER.format(self.__role_id),
            headers=self.__headers,
        )
        response.raise_for_status()
        return response.json()


def my_raise_for_status(response):
    """Raise HTTPError based on response status."""
    if 400 <= response.status_code < 600:
        raise HTTPError(
            url=response.url,
            hdrs=response.headers,
            fp=None,
            code=response.status_code,
            msg=f'response failed with status {response.status_code}, headers{response.headers} and content {response.content}',
        )
    response.raise_for_status()
