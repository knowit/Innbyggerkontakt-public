import base64
import json
from unittest import mock

import pytest
from cloudevents.http import CloudEvent
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.response import (
    UttrekkDataResponse,
)
from krr_models import HentPersonerResponse
from tests.mock_data import krr_test_persons, krr_test_persons_only_nnids

import services


with mock.patch('otel_setup.instrument_cloud_function') as mock_logger:
    from main import get_phone_numbers_from_krr


@pytest.fixture
def example_data() -> dict:
    return {
        'organizationId': 'development',
        'jobbId': '839deaaf-675b-4061-a9fc-e4a767221a37',
        'batchNumber': 0,
        'bulletinId': 'test-bulletin',
        'bucketName': 'innbyggerkontakt-dev',
        'kNumber': 2,
    }


@pytest.fixture
def cloud_event(example_data) -> CloudEvent:
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }

    b64_data = {
        'message': {
            'data': base64.b64encode(json.dumps(example_data).encode(encoding='utf-8'))
        },
        'subscription': 'test-subscription',
    }

    return CloudEvent(attributes, b64_data)


@mock.patch('services.get_nnids_from_bucket')
@mock.patch('services.divide_list')
@mock.patch('services.get_persons_from_krr')
@mock.patch('main.filter')
@mock.patch('services.upload_phone_numbers_to_storage')
@mock.patch('services.publish_to_pubsub')
def test_get_phone_numbers_from_krr(
    mock_publish_to_pubsub,
    mock_upload_phone_numbers_to_storage,
    mock_filter,
    mock_get_persons_from_krr,
    mock_divide_list,
    mock_get_nnids_from_bucket,
    cloud_event,
):
    mock_get_nnids_from_bucket.return_value = UttrekkDataResponse(
        dokumentidentifikator=None,
        feilmelding=None,
        foedselsEllerDNummer=krr_test_persons_only_nnids,
    )

    mock_divide_list.return_value = krr_test_persons_only_nnids

    mock_get_persons_from_krr.return_value = HentPersonerResponse(**krr_test_persons)
    dummy_phone_numbers = ['+4799999999', '+4799999998', '+4799999997']
    mock_filter.return_value = [
        mock.MagicMock(**{'kontaktinformasjon.mobiltelefonnummer': number})
        for number in dummy_phone_numbers
    ]

    get_phone_numbers_from_krr(cloud_event=cloud_event)

    mock_get_nnids_from_bucket.assert_called_once_with(
        org_id='development',
        bulletin_id='test-bulletin',
        jobb_id='839deaaf-675b-4061-a9fc-e4a767221a37',
        batch_number=0,
    )
    mock_divide_list.assert_called_once_with(krr_test_persons_only_nnids, 2)
    mock_get_persons_from_krr.assert_called_once_with(
        krr_test_persons_only_nnids, 'development'
    )
    mock_filter.assert_called_once_with(
        services.active_and_valid, HentPersonerResponse(**krr_test_persons).personer
    )
    mock_upload_phone_numbers_to_storage.assert_called_once_with(
        phone_numbers=[
            '+4799999999',
            '+4799999998',
            '+4799999997',
        ],
        org_id='development',
        bulletin_id='test-bulletin',
        jobb_id='839deaaf-675b-4061-a9fc-e4a767221a37',
        batch_number=0,
        k_number=2,
    )
    mock_publish_to_pubsub.assert_called_once()
