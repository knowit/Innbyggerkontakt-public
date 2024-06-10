import asyncio
import json
from unittest.mock import patch

import recipients_client.recipients_client
import respx
from freezegun import freeze_time
from pytest import fixture
from responses import POST, RequestsMock

from models.bulletin import Bulletin


BULLETIN_ID = 'test_bulletin'
ORGANIZATION_ID = 'test_organization'
MOCK_RECIPIENTS_URL = 'https://www.recipients.com'
recipients_client.recipients_client.RECIPIENTS_URL = MOCK_RECIPIENTS_URL
LOCAL_VARIABLES = ['name']
OSLO_REG_ROA = 'matrikkel/oslo_reg_roa'
OSLO_REG_BJERKE = 'matrikkel/oslo_reg_bjerke'
OSLO_REG_NORDRE_AKER = 'matrikkel/oslo_reg_nordre_aker'
OSLO_REG_GRORUD = 'matrikkel/oslo_reg_grorud'
OSLO_REG_STOVNER = 'matrikkel/oslo_reg_stovner'
REG_URLS = {
    'Roa': OSLO_REG_ROA,
    'Bjerke': OSLO_REG_BJERKE,
    'Nordre Aker': OSLO_REG_NORDRE_AKER,
    'Grorud': OSLO_REG_GRORUD,
    'Stovner': OSLO_REG_STOVNER,
}

JWT_URL = (
    'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience='
    'https://www.recipients.com'
)


@fixture
def mocked_responses():
    with RequestsMock() as reqs:
        yield reqs


@fixture
def mocked_httpx_responses():
    with respx.mock() as respx_mock:
        yield respx_mock


@fixture
def bulletin_dict():
    with open('tests/mock_data/test_bulletin_search.json') as json_file:
        yield json.loads(json_file.read())


@freeze_time('01-22-2021')
@patch('recipients_client.recipients_client.get_jwt')
def test_request_single(
    get_jwt_mock,
    mocked_responses,
    bulletin_dict,
    monkeypatch,
):
    monkeypatch.setenv('RECIPIENTS_URL', 'https://www.recipients.com')
    post_url = f'https://www.recipients.com/freg/person/{BULLETIN_ID}/01234567890'
    get_jwt_mock.return_value = 'jwt_token'
    # mocked_responses.add(GET, JWT_URL, body="jwt_token", status=200)
    mocked_responses.add(POST, post_url, status=200)
    bulletin = Bulletin(**bulletin_dict)
    rec_client = recipients_client.recipients_client.RecipientsClient(
        ORGANIZATION_ID, BULLETIN_ID, '0000'
    )
    rec_client.request_single('01234567890', bulletin.recipients.query, LOCAL_VARIABLES)

    assert json.loads(mocked_responses.calls[0].request.body) == [
        {
            'gender': 'mann',
            'zip_codes': ['0000'],
            'include_residing_address': True,
            'date_of_birth_from': '1981-01-22',
            'date_of_birth_to': '2001-01-22',
            'find_parent': False,
        }
    ]
    assert (
        mocked_responses.calls[0].request.headers['authorization'] == 'Bearer jwt_token'
    )
    assert (
        mocked_responses.calls[0].request.headers['organization-id'] == ORGANIZATION_ID
    )
    assert mocked_responses.calls[0].request.headers['municipality-number'] == '0000'


@freeze_time('01-22-2021')
@patch('recipients_client.recipients_client.get_jwt')
def test_request_search(
    get_jwt_mock,
    mocked_responses,
    bulletin_dict,
    monkeypatch,
):
    monkeypatch.setenv('RECIPIENTS_URL', 'https://www.recipients.com')
    post_url = f'https://www.recipients.com/freg/search/{BULLETIN_ID}'
    get_jwt_mock.return_value = 'jwt_token'

    # mocked_responses.add(GET, JWT_URL, body="jwt_token", status=200)
    mocked_responses.add(POST, post_url, status=200)
    bulletin = Bulletin(**bulletin_dict)
    rec_client = recipients_client.recipients_client.RecipientsClient(
        ORGANIZATION_ID, BULLETIN_ID, '0000'
    )

    rec_client.request_search(LOCAL_VARIABLES, bulletin.recipients.query)

    assert json.loads(mocked_responses.calls[0].request.body) == [
        {
            'gender': 'mann',
            'zip_codes': ['0000'],
            'include_residing_address': True,
            'date_of_birth_from': '1981-01-22',
            'date_of_birth_to': '2001-01-22',
            'find_parent': False,
        }
    ]

    assert (
        mocked_responses.calls[0].request.headers['authorization'] == 'Bearer jwt_token'
    )
    assert (
        mocked_responses.calls[0].request.headers['organization-id'] == ORGANIZATION_ID
    )
    assert mocked_responses.calls[0].request.headers['municipality-number'] == '0000'


@freeze_time('01-22-2021')
@patch('recipients_client.recipients_client.get_jwt')
def test_request_matrikkel_add_building_owners_polygon(
    get_jwt_mock,
    mocked_httpx_responses,
    monkeypatch,
):
    monkeypatch.setenv('RECIPIENTS_URL', 'https://www.recipients.com')

    for value in REG_URLS.values():
        post_url = f'https://www.recipients.com/{value}/{BULLETIN_ID}'

        get_jwt_mock.return_value = 'jwt_token'
        mocked_httpx_responses.post(post_url).respond(200)

    rec_client = recipients_client.recipients_client.RecipientsClient(
        ORGANIZATION_ID, BULLETIN_ID, '0000'
    )

    asyncio.run(rec_client.request_matrikkel_oslo_reg())

    assert (
        mocked_httpx_responses.calls[0].request.headers['authorization']
        == 'Bearer jwt_token'
    )
    assert (
        mocked_httpx_responses.calls[0].request.headers['organization-id']
        == ORGANIZATION_ID
    )
    assert (
        mocked_httpx_responses.calls[0].request.headers['municipality-number'] == '0000'
    )
