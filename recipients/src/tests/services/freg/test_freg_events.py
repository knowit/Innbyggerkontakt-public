from unittest.mock import call

import pytest

import freg_config
from models import event_model, freg_model
from services.freg.freg_events import FregEvents


@pytest.fixture()
def event_client(mocker):
    yield FregEvents()


@pytest.fixture(autouse=True)
def mock_gcp(mocker):
    yield mocker.patch('services.freg.freg_events.gcp', autospec=True)


@pytest.fixture(autouse=True)
def mock_events(mocker):
    yield mocker.patch('services.freg.freg_events.events', autospec=True)


@pytest.fixture(autouse=True)
def mock_freg_client(mocker):
    my_mock = mocker.patch('services.freg.freg_events.FregClient', autospec=True)
    yield my_mock.return_value


def test_event_feed(
    event_client,
    mock_gcp,
    mock_freg_client,
    get_event_feed,
    get_test_lookup,
    mock_events,
):
    mock_gcp.CloudStorage.return_value.get_file_from_bucket.side_effect = [
        [
            {'name': 'line 1', 'org_num': '1111'},
            {'name': 'line 2', 'org_num': '2222'},
            {'name': 'line 3', 'org_num': '3333'},
        ],
        0,
        0,
        0,
    ]

    event_feed = [event_model.EventWrapper(**event) for event in get_event_feed]

    freg_persons = freg_model.Lookup(**get_test_lookup).lookup

    mock_freg_client.get_feed.side_effect = [
        event_feed[0:5],
        event_feed[5:9],
        [],
        event_feed[0:5],
        event_feed[5:9],
        [],
        event_feed[0:5],
        event_feed[5:9],
        [],
    ]
    mock_freg_client.get_person_info.side_effect = [
        freg_persons[0:4],
        freg_persons[4:7],
        freg_persons[0:4],
        freg_persons[4:7],
        freg_persons[0:4],
        freg_persons[4:7],
    ]
    mock_events.get_event_type.side_effect = [
        ['flyttingInnenKommune', '3333'],
        ['flyttingTilKommune', '1111'],
        [None, None],
        ['flyttingInnenKommune', '0003'],
        ['flyttingTilKommune', '3333'],
        [None, None],
        ['flyttingInnenKommune', '2222'],
        ['flyttingInnenKommune', '3333'],
        ['flyttingTilKommune', '1111'],
        [None, None],
        ['flyttingInnenKommune', '0003'],
        ['flyttingTilKommune', '3333'],
        [None, None],
        ['flyttingInnenKommune', '2222'],
        ['flyttingInnenKommune', '3333'],
        ['flyttingTilKommune', '1111'],
        [None, None],
        ['flyttingInnenKommune', '0003'],
        ['flyttingTilKommune', '3333'],
        [None, None],
        ['flyttingInnenKommune', '2222'],
    ]

    event_client.event_feed()
    mock_gcp.Publisher.return_value.publish_message.assert_called_once_with = call(
        data={
            'municipality_number': '1111',
            'freg_identifier': freg_persons[1].birth_or_d_number,
        },
        event_type='flyttingTilKommune',
    )

    mock_gcp.Publisher.return_value.publish_message.assert_has_calls(
        [
            call(
                data={
                    'municipality_number': '3333',
                    'freg_identifier': freg_persons[0].birth_or_d_number,
                },
                event_type='flyttingInnenKommune',
            ),
            call(
                data={
                    'municipality_number': '3333',
                    'freg_identifier': freg_persons[4].birth_or_d_number,
                },
                event_type='flyttingTilKommune',
            ),
        ]
    )

    mock_gcp.Publisher.return_value.publish_message.assert_called_once_with = call(
        data={
            'municipality_number': '2222',
            'freg_identifier': freg_persons[6].birth_or_d_number,
        },
        event_type='flyttingInnenKommune',
    )

    assert mock_freg_client.get_feed.call_count == 9

    assert mock_gcp.Publisher.return_value.publish_message.call_count == 4

    mock_gcp.CloudStorage.return_value.upload_file_to_bucket.assert_has_calls(
        [
            call(freg_config.LAST_SEQUENCE_LOCATION.format(org_id='line 1'), text='9'),
            call(freg_config.LAST_SEQUENCE_LOCATION.format(org_id='line 2'), text='9'),
            call(freg_config.LAST_SEQUENCE_LOCATION.format(org_id='line 3'), text='9'),
            call(freg_config.GENERAL_LAST_SEQUENCE_LOCATION, text='9'),
        ]
    )

    assert mock_gcp.CloudStorage.return_value.upload_file_to_bucket.call_count == 5


def test_save_last_sequence(event_client, mock_freg_client, mock_gcp):
    mock_freg_client.get_last_feed_sequence.return_value = 10
    last_seq = event_client.save_last_sequence()
    assert last_seq == 10

    mock_gcp.CloudStorage.return_value.upload_file_to_bucket.assert_called_once_with(
        freg_config.GENERAL_LAST_SEQUENCE_LOCATION, text='10'
    )
