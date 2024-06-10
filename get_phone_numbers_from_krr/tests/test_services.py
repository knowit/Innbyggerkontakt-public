import json
from unittest import mock

import pytest
from krr_models import HentPersonerResponse
from ps_message.krr_message import KRRMessage
from tests.mock_data import krr_test_persons, krr_test_persons_only_nnids

import services


@pytest.mark.parametrize('k_number', range(5))
def test_divide_list(k_number):
    mock_list = [str(i) for i in range(10**6, 10**6 + 5000)]
    return_list = services.divide_list(in_list=mock_list, k_number=k_number)
    assert len(return_list) == services.MAX_KRR_BATCH_SIZE
    assert return_list[0] == mock_list[k_number * services.MAX_KRR_BATCH_SIZE]
    assert (
        return_list[-1] == mock_list[(k_number + 1) * services.MAX_KRR_BATCH_SIZE - 1]
    )


@mock.patch('services.storage.Client')
def test_get_nnids_from_bucket(mock_storage_client):
    mock_storage_client.return_value.bucket.return_value.blob.return_value.download_as_text.return_value = json.dumps(
        {
            'dokumentidentifikator': None,
            'feilmelding': None,
            'foedselsEllerDNummer': [str(i) for i in range(10**10, 10**10 + 5000)],
        }
    )
    uttrekk = services.get_nnids_from_bucket(
        org_id='test-org',
        bulletin_id='test-bulletin',
        jobb_id='1',
        batch_number=0,
    )
    assert uttrekk is not None
    assert len(uttrekk.foedsels_eller_d_nummer) == 5000
    assert len(uttrekk.foedsels_eller_d_nummer[0]) == 11


@mock.patch('services.gcp.get_secret')
@mock.patch('services.Auth')
@mock.patch('services.AuthRequest')
def test_get_persons_from_krr(mock_auth_request, mock_auth, mock_get_secret):
    # default_language = 'nb'
    mock_auth_request.return_value.request.return_value.status_code = 200
    mock_auth_request.return_value.request.return_value.json.return_value = (
        krr_test_persons
    )
    person_list = services.get_persons_from_krr(
        krr_test_persons_only_nnids, 'test_organization'
    )
    mock_auth_request.return_value.request.assert_called_once_with(
        'https://test.kontaktregisteret.no/rest/v1/personer',
        data={'personidentifikatorer': krr_test_persons_only_nnids},
        headers={'content-type': 'application/json'},
    )

    assert isinstance(person_list, HentPersonerResponse)
    assert len(person_list.personer) == 19


@pytest.mark.integration_test
def test_get_persons_from_krr_integration_test():
    nnids = [p['personidentifikator'] for p in krr_test_persons['personer']]

    persons = services.get_persons_from_krr(nnids, 'lillevik')
    assert len(persons.personer) == len(nnids)


def test_filter_person_phone_numbers():
    hent_personer_response = HentPersonerResponse(**krr_test_persons)
    filtered = services.filter_person_phone_numbers(hent_personer_response.personer)
    assert len(filtered) == 10


@mock.patch('services.storage.Client')
def test_upload_phone_numbers_to_storage(mock_storage_client):
    phone_numbers = ['+4799999999', '+4799999998', '+4799999997']
    services.upload_phone_numbers_to_storage(
        phone_numbers, 'test-org', 'test-bulletin', 'abc-def-jobb-id', '1', '2'
    )

    mock_storage_client.return_value.bucket.return_value.blob.return_value.upload_from_string.assert_called_once_with(
        '["+4799999999", "+4799999998", "+4799999997"]'
    )
    mock_storage_client.return_value.bucket.return_value.blob.assert_called_once_with(
        'sms-phone-numbers/test-org/test-bulletin/abc-def-jobb-id/1_2.json'
    )


@mock.patch('services.pubsub_v1.PublisherClient')
def test_publish_to_pubsub(mock_publisher_client):
    message = KRRMessage(
        organization_id='test_org',
        jobb_id='test_jobb',
        bulletin_id='test-bulletin',
        batch_number=1,
        k_number=3,
    )
    services.publish_to_pubsub('topic-id', message.encode_for_pubsub())
    assert mock_publisher_client.return_value.publish.call_count == 1
