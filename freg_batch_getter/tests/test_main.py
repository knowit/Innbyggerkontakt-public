import base64
import json
import os
from unittest.mock import MagicMock

import pytest
from cloudevents.http import CloudEvent
from ps_message.freg_batch_getter import FregBatchGetter
from ps_message.krr_message import KRRMessage
from pytest_mock import MockerFixture

import main
from main import fetch_batch

from services import _number_of_pubsubs_to_send


@pytest.fixture
def example_data() -> dict:
    return {
        'organization_id': 'development',
        'jobb_id': '839deaaf-675b-4061-a9fc-e4a767221a37',
        'batch_number': 0,
        'bulletin_id': 'just_a_dummy_bulletin_id',
    }


test_data = [
    (5000, 1000, 5),
    (4999, 1000, 5),
    (4001, 1000, 5),
    (4000, 1000, 4),
    (3999, 1000, 4),
    (1, 1000, 1),
    (0, 1000, 0),
]


def test_conversion_from_freg_batch_message_to_krr_message():
    fbg_message = FregBatchGetter(
        batch_number=21,
        jobb_id='dummy_jobbid',
        bulletin_id='dummy_buletin_id',
        organization_id='dummy org_id',
    )
    krr_message = KRRMessage(**fbg_message.dict(), k_number=0)
    assert krr_message.batch_number == 21


@pytest.mark.parametrize(
    'big_list,small_list,expected',
    test_data,
    ids=[f'big: {t[0]} small : {t[1]}' for t in test_data],
)
def test_number_of_pubsub_to_send(big_list, small_list, expected):
    assert _number_of_pubsubs_to_send(big_list, small_list) == expected


@pytest.fixture
def cloud_event(example_data) -> CloudEvent:
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }
    b64_data = base64.b64encode(json.dumps(example_data).encode(encoding='utf-8'))

    return CloudEvent(
        attributes,
        data={'message': {'data': b64_data}, 'subscription': 'bigco-subscription-1234'},
    )


@pytest.fixture
def mock_context():

    context = MagicMock()
    context.event_id = '617187464135194'
    context.timestamp = '2019-07-15T22:09:03.761Z'
    context.resource = {
        'name': 'projects/my-project/topics/my-topic',
        'service': 'pubsub.googleapis.com',
        'type': 'type.googleapis.com/google.pubsub.v1.PubsubMessage',
    }
    return context


@pytest.mark.integration_test
def test_send_pub_sub(mocker: MockerFixture, example_data: dict):
    from services import create_pubsub

    create_pubsub(topic=os.getenv('START_BATCH_TOPIC'), encoded_message=example_data)


@pytest.mark.integration_test
def test_freg_fetch_batches_no_mock(
    cloud_event: CloudEvent, example_data: dict, mocker: MockerFixture
):
    upload_spy = mocker.spy(main, 'upload_batch_to_bucket')
    ret = main.fetch_batch(cloud_event=cloud_event)
    upload_spy.assert_called_once()
    assert ret is None


def test_fetch_batches_function_only(
    cloud_event: CloudEvent, example_data: dict, mocker: MockerFixture
):
    mocker.patch('main.publish_to_pubsub')
    upload_mock = mocker.patch('main.upload_batch_to_bucket')
    collect_mock = mocker.patch('main.collect_batch')
    mocker.patch('main.digdir.Auth')
    request_mock = MagicMock()
    request_mock.status_code = 200
    full_batch_mock = MagicMock()
    full_batch_mock.foedsels_eller_d_nummer.__len__.return_value = 5000
    collect_mock.return_value = request_mock, full_batch_mock

    fetch_batch(cloud_event=cloud_event)
    upload_mock.assert_called_once()
    collect_mock.assert_called_once()


@pytest.mark.integration_test
def test_freg_fetch_and_upload_batch_to_bucket(
    cloud_event: CloudEvent, mocker: MockerFixture
):
    pubsub_mock = mocker.patch('main.publish_to_pubsub')
    ret = fetch_batch(cloud_event=cloud_event)
    pubsub_mock.assert_called()
    assert ret is None
