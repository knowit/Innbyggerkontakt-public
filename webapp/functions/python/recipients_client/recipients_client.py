"""Recipients client."""
import asyncio
import json
import os
from typing import List

import google.auth.transport.requests
import google.oauth2.id_token
import httpx
import requests
from firebase import db

from models.bulletin import Bulletin, MMLFilter, Query
from models.recipients_request_model import (
    RecipientsRequestHeader,
    RecipientsRequestParams,
)


PERSON = '/freg/person/{bulletin_id}/{folkeregisteridentifikator}'
SEARCH = '/freg/search/{bulletin_id}'
MML_UPLOAD_URL = '/mml/clean-upload/{bulletin_id}/{filter_id}'
MML_SEND_URL = '/mml/send/{bulletin_id}'
PRESEARCH = '/freg/presearch/{bulletin_id}'
CABIN_OWNERS = '/matrikkel/cabin_owners/{bulletin_id}'
REG_URLS = {
    'Roa': '/matrikkel/oslo_reg_roa/{bulletin_id}',
    'Bjerke': '/matrikkel/oslo_reg_bjerke/{bulletin_id}',
    'Nordre Aker': '/matrikkel/oslo_reg_nordre_aker/{bulletin_id}',
    'Grorud': '/matrikkel/oslo_reg_grorud/{bulletin_id}',
    'Stovner': '/matrikkel/oslo_reg_stovner/{bulletin_id}',
}
RECIPIENTS_URL = os.getenv('RECIPIENTS_URL')


def get_jwt() -> str:
    """Get oauth2 id-token aka JWT.

    If you have a key-file.json, you can specify its path with
    the env variable GOOGLE_APPLICATION_CREDENTIALS.
    """
    auth_req = google.auth.transport.requests.Request()
    return google.oauth2.id_token.fetch_id_token(auth_req, RECIPIENTS_URL)


class RecipientsClient:
    """Recipients client."""

    def __init__(
        self,
        organization_id: str,
        bulletin_id: str,
        municipality_number: str = None,
    ):
        self.bulletin_id = bulletin_id
        self.organization_id = organization_id
        self.municipality_number = municipality_number

    def get_headers(self, bulletin_type=None) -> dict:
        """Return all headers needed or recipients."""
        jwt = get_jwt()
        headers = RecipientsRequestHeader(
            authorization=f'Bearer {jwt}',
            organization_id=self.organization_id,
            bulletin_type=bulletin_type,
            municipality_number=self.municipality_number,
        )
        headers = headers.dict(by_alias=True, exclude_none=True)
        return headers

    def request_single(
        self,
        folkeregisteridentifikator: str,
        query: List[Query],
        local_variables: List[str],
    ) -> requests.Response:
        """Make a request for a known folkeregisteridentifikator."""
        url = RECIPIENTS_URL + PERSON.format(
            bulletin_id=self.bulletin_id,
            folkeregisteridentifikator=folkeregisteridentifikator,
        )
        response = requests.post(
            url,
            json.dumps([q.base_dict() for q in query], default=str),
            headers=self.get_headers('event'),
            params={'parts': local_variables},
        )

        print(f'Recipients returned result: {response.text}')

        response.raise_for_status()
        return response

    def request_search(
        self,
        local_variables: str,
        query: List[Query],  # TODO(Anders) reaname to freg_search
        bulletin_type: str = 'search',
    ) -> requests.Response:
        """Do a search in recipients."""
        url = RECIPIENTS_URL + SEARCH.format(bulletin_id=self.bulletin_id)
        params = RecipientsRequestParams(parts=local_variables)
        response = requests.post(
            url,
            json.dumps([q.base_dict() for q in query], default=str),
            headers=self.get_headers(bulletin_type),
            params=params.dict(by_alias=True, exclude_none=True),
        )

        print(f'Recipients returned result: {response.text}')

        response.raise_for_status()

        return response

    def request_mml_send(self, bulletin_type: str = 'search'):
        """Send a bulletin ref to recipients."""
        url = RECIPIENTS_URL + MML_SEND_URL.format(bulletin_id=self.bulletin_id)
        response = requests.post(
            url,
            headers=self.get_headers(bulletin_type),
        )

        response.raise_for_status()

    def request_mml_upload(
        self,
        recipients: MMLFilter,
        bulletin_type: str = 'search',
    ) -> requests.Response:
        """Send list of mml-filters to mml-router that will download list of people."""
        url = RECIPIENTS_URL + MML_UPLOAD_URL.format(
            bulletin_id=self.bulletin_id, filter_id=recipients.filter_id
        )

        response = requests.post(
            url,
            json=json.loads(recipients.json(exclude={'mmlpersons'})),
            # (ASN) workaround, MMLFilter.timestamp should be int or str
            headers=self.get_headers(bulletin_type),
        )
        response.raise_for_status()
        return response

    def request_presearch(self) -> requests.Response:
        """Do a presearch in recipients."""
        organization_ref = db.collection('organization').document(self.organization_id)
        bulletin_ref = (
            organization_ref.collection('bulletin')
            .document('draft')
            .collection('default')
            .document(self.bulletin_id)
            .get()
        )
        bulletin = Bulletin(**bulletin_ref.to_dict())
        self.municipality_number = organization_ref.get().to_dict()[
            'municipalityNumber'
        ]
        url = RECIPIENTS_URL + PRESEARCH.format(bulletin_id=self.bulletin_id)
        response = requests.post(
            url,
            json.dumps([q.base_dict() for q in bulletin.recipients.query], default=str),
            headers=self.get_headers(),
        )

        response.raise_for_status()
        return response.content, response.status_code

    def request_matrikkel_cabin_owners(
        self, bulletin_type: str = 'search'
    ) -> requests.Response:
        """Request cabin owners in municipality."""
        url = RECIPIENTS_URL + CABIN_OWNERS.format(bulletin_id=self.bulletin_id)

        response = requests.post(url, headers=self.get_headers(bulletin_type))

        print(f'Recipients returned result: {response.text}')

        response.raise_for_status()

        return response.status_code

    async def request_matrikkel_oslo_reg(
        self,
        bulletin_type: str = 'search',
    ) -> httpx.Response:
        """Request building owners (REG)."""
        headers = self.get_headers(bulletin_type)

        formatted_reg_urls = {
            key: RECIPIENTS_URL + value.format(bulletin_id=self.bulletin_id)
            for (key, value) in REG_URLS.items()
        }

        responses = {}
        tasks = []

        async with httpx.AsyncClient(timeout=900) as client:
            for name, url in formatted_reg_urls.items():
                tasks.append(
                    asyncio.ensure_future(
                        self._post_oslo_reg(client, url, headers, name)
                    )
                )

            original_oslo_reg = await asyncio.gather(*tasks)
            for code, name in original_oslo_reg:
                responses[name] = code

        if set(responses.values()) == {200}:
            return responses, 200

        return responses, 503

    # pylint: disable=R0201
    async def _post_oslo_reg(self, client, url, headers, name):
        resp = await client.post(url, headers=headers)

        return resp.status_code, name
