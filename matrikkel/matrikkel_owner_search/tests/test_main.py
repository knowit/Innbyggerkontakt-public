import base64
import copy
import json
from unittest import mock

import pytest
from cloudevents.http import CloudEvent
from ps_message.matrikkel_owner_search.matrikkel_owner_search import (
    MatrikkelOwnerSearchEvent,
)


with mock.patch('otel_setup.instrument_cloud_function') as mock_logger:
    from main import matrikkel_owner_search


@pytest.fixture()
def get_matrikkel_owner_search_event():
    # TODO: Lag mock data for MatrikkelOwnerSearchEvent
    with open(
        'tests/MatrikkelOwnerSearchEventFirstBatch.json', 'r', encoding='utf-8'
    ) as json_file:
        yield json.load(json_file)


@pytest.fixture
def cloud_event(get_matrikkel_owner_search_event) -> CloudEvent:
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }

    b64_data = {
        'message': {
            'data': base64.b64encode(
                json.dumps(get_matrikkel_owner_search_event).encode(encoding='utf-8')
            )
        },
        'subscription': 'test-subscription',
    }

    return CloudEvent(attributes, b64_data)


@mock.patch('main.get_person_data')
@mock.patch('main.upload_data_to_bucket')
@mock.patch('main.publish_messages')
def test_matrikkel_owner_search(
    mock_publish_messages,
    mock_upload_data_to_bucket,
    mock_get_person_data,
    cloud_event,
):
    # setup return values on mock
    mock_get_person_data.return_value = [
        {'freg_identifier': '00000000000', 'name': 'Per Mo'},
        {'freg_identifier': '00000000001', 'name': 'Kristin Samle'},
        {'freg_identifier': '00000000002', 'name': 'Åge Ågeskar'},
    ]

    mock_upload_data_to_bucket.return_value = {
        'hits': 3,
        'path': 'matrikkel/recipients/123456/789012/',
    }

    # make calls
    cloud_event_copy = copy.deepcopy(cloud_event)
    owner_search_event = MatrikkelOwnerSearchEvent.from_cloud_event(cloud_event_copy)
    response = matrikkel_owner_search(cloud_event=cloud_event)

    # assert
    mock_get_person_data.assert_called_once_with(owner_search_event)
    mock_upload_data_to_bucket.assert_called_once_with(
        owner_search_event,
        [
            {'freg_identifier': '00000000000', 'name': 'Per Mo'},
            {'freg_identifier': '00000000001', 'name': 'Kristin Samle'},
            {'freg_identifier': '00000000002', 'name': 'Åge Ågeskar'},
        ],
    )
    mock_publish_messages.assert_called_once_with(
        owner_search_event,
        {
            'hits': 3,
            'path': f'matrikkel/recipients/{owner_search_event.organization_id}/{owner_search_event.bulletin_id}/',
        },
    )
    # todo må mocke returnverdi til upload_data_to_bucket
    assert response == (200, 'ok')
