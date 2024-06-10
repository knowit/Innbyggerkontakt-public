import base64
import copy
import json
from unittest import mock

import pytest
from cloudevents.http import CloudEvent
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent


with mock.patch('otel_setup.instrument_cloud_function') as mock_logger:
    from main import matrikkel_search


@pytest.fixture()
def get_matrikkel_search_event():
    with open('tests/MatrikkelSearchEvent.json', 'r', encoding='utf-8') as json_file:
        yield json.load(json_file)


@pytest.fixture
def cloud_event(get_matrikkel_search_event) -> CloudEvent:
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }

    b64_data = {
        'message': {
            'data': base64.b64encode(
                json.dumps(get_matrikkel_search_event).encode(encoding='utf-8')
            )
        },
        'subscription': 'test-subscription',
    }

    return CloudEvent(attributes, b64_data)


@mock.patch('main.store_matrikkel_data_in_bucket')
@mock.patch('main.store_person_ids_in_bucket')
@mock.patch('main.publish_owner_search_message')
@mock.patch('main.get_matrikkel_data')
def test_matrikkel_search(
    mock_get_matrikkel_data,
    mock_publish_owner_search_message,
    mock_store_person_ids_in_bucket,
    mock_store_matrikkel_data_in_bucket,
    cloud_event,
):
    # setup return values on mock
    mock_get_matrikkel_data.return_value = (
        ['999999999', '999999998', '999999997'],
        ['1111111', '1111112', '1111113', '1111114', '1111115'],
    )
    mock_store_person_ids_in_bucket.return_value = 'person_id_bucket'
    mock_store_matrikkel_data_in_bucket.return_value = 'matrikkel_id_bucket'

    # make calls
    cloud_event_copy = copy.deepcopy(cloud_event)
    search_event = MatrikkelSearchEvent.from_cloud_event(cloud_event_copy)
    response = matrikkel_search(cloud_event=cloud_event)

    # assert
    mock_get_matrikkel_data.assert_called_once_with(search_event)
    mock_store_matrikkel_data_in_bucket.assert_called_once_with(
        search_event, ['999999999', '999999998', '999999997']
    )
    mock_store_person_ids_in_bucket.assert_called_once_with(
        search_event, ['1111111', '1111112', '1111113', '1111114', '1111115']
    )
    mock_publish_owner_search_message.assert_called_once_with(search_event, 5)
    assert response == (200, 'ok')
