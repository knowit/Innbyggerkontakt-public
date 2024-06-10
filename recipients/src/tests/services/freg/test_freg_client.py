from unittest import mock

import pytest
import responses
from requests import get, post
from services.freg import freg_client


@pytest.fixture()
def default_freg_client():
    return freg_client.FregClient('test_organization')


@pytest.fixture(autouse=True)
def mock_gcp(mocker):
    my_mock = mocker.patch('services.freg.freg_client.gcp', autospec=True)
    my_mock.get_secret.return_value = 'test'
    yield my_mock


@pytest.fixture(autouse=True)
def mock_digdir(mocker):
    my_mock = mocker.patch('services.freg.freg_client.digdir', autospec=True)
    my_mock.AuthRequest.return_value.request_post = mock.MagicMock(side_effect=post)
    my_mock.AuthRequest.return_value.request_get = mock.MagicMock(side_effect=get)
    yield my_mock


def test_get_person_info(default_freg_client, mocked_responses, get_test_lookup):
    person_identifiers = ['00000000000', '00000000001', '00000000002', '00000000003']
    parts = ['part1', 'part2', 'part3']
    mocked_responses.add(responses.POST,
                         'https://test-fiks.no/folkeregister/api/v1/test/v1/personer/bulkoppslag',
                         json=get_test_lookup,
                         match=[
                             responses.matchers.json_params_matcher(
                                 {'foedselsEllerDNummer': ['00000000000', '00000000001', '00000000002', '00000000003']})
                         ])
    default_freg_client.get_person_info(person_identifiers, parts)


@mock.patch('services.freg.freg_client.time')
def test_extract(mock_time, default_freg_client, mocked_responses):
    query = {
        'personstatustyper': ['bosatt'],
        'kjoenn': 'kvinne',
        'kommunenummer': {
            'bostedskommunenummer': '0000'
        }
    }

    mocked_responses.add(responses.POST,
                         'https://test-fiks.no/folkeregister/api/v1/test/v1/uttrekk/tilpasset',
                         json={'jobbId': 'test_jobb_id'},
                         match=[
                             responses.matchers.json_params_matcher(query)
                         ])
    mocked_responses.add(responses.GET,
                         'https://test-fiks.no/folkeregister/api/v1/test/v1/uttrekk/test_jobb_id/batch/0',
                         json={'foedselsEllerDNummer': ['00000000000', '00000000001', '00000000002', '00000000003']})
    mocked_responses.add(responses.GET,
                         'https://test-fiks.no/folkeregister/api/v1/test/v1/uttrekk/test_jobb_id/batch/1',
                         json={'foedselsEllerDNummer': ['00000000004', '00000000005', '00000000006', '00000000007']})
    mocked_responses.add(responses.GET,
                         'https://test-fiks.no/folkeregister/api/v1/test/v1/uttrekk/test_jobb_id/batch/2',
                         json={'foedselsEllerDNummer': []})

    response = default_freg_client.extract(query)
    assert response == ['00000000000', '00000000001', '00000000002', '00000000003',
                        '00000000004', '00000000005', '00000000006', '00000000007']
