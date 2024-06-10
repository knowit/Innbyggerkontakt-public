import json
from datetime import datetime
from unittest.mock import patch

import pytz
from event_trigger import event_trigger as et
from freezegun import freeze_time
from mockfirestore import MockFirestore
from pytest import fixture

from models.bulletin import Bulletin, EventType


BULLETIN_ID = 'test_bulletin'
ORGANIZATION_ID = 'test_organization'


@fixture
def bulletin_event_dict():
    with open('tests/mock_data/test_bulletin_event.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def pubsub_dict():
    with open('tests/mock_data/test_event_trigger_pubsub.json', 'r') as json_file:
        yield json.loads(json_file.read())


@patch('event_trigger.event_trigger.FirestoreTrigger', autospec=True)
@patch('event_trigger.event_trigger.firebase', autospec=True)
def test_event_trigger_instant(
    firebase_mock, firestore_trigger_mock, pubsub_dict, bulletin_event_dict
):
    bulletin = Bulletin(**bulletin_event_dict)
    bulletin.recipients.event.event_type = EventType.FLYTTING_TIL_KOMMUNE
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).set(
        {'municipalityNumber': '0000'}
    )
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('event').document(BULLETIN_ID).set(
        bulletin.dict(by_alias=True)
    )
    firebase_mock.db = mock_db
    et.event_trigger(pubsub_dict, None)

    assert firestore_trigger_mock.return_value.instant.call_count == 1
    assert firestore_trigger_mock.return_value.instant.call_args[0] == (bulletin,)
    assert firestore_trigger_mock.return_value.instant.call_args[1] == {
        'folkeregisteridentifikator': '01234567890'
    }


@freeze_time('2021-01-21')
@patch('event_trigger.event_trigger.FirestoreTrigger', autospec=True)
@patch('event_trigger.event_trigger.firebase', autospec=True)
def test_event_trigger_schedule(
    firebase_mock, firestore_trigger_mock, pubsub_dict, bulletin_event_dict, monkeypatch
):
    monkeypatch.setenv('APP_ENGINE_REGION', 'test_region')
    monkeypatch.setenv('RECIPIENTS_TRIGGER_SERVICE_ACCOUNT', 'test_service_account')
    bulletin = Bulletin(**bulletin_event_dict)
    bulletin.recipients.event.event_type = EventType.FLYTTING_TIL_KOMMUNE
    bulletin.execution.delay = '5/5/5'
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).set(
        {'municipalityNumber': '0000'}
    )
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('event').document(BULLETIN_ID).set(
        bulletin.dict(by_alias=True)
    )
    firebase_mock.db = mock_db
    et.event_trigger(pubsub_dict, None)

    assert firestore_trigger_mock.return_value.schedule.call_count == 1
    assert firestore_trigger_mock.return_value.schedule.call_args[0] == (
        bulletin,
        pytz.timezone('Europe/Oslo').localize(
            datetime(year=2026, month=1, day=26, hour=5)
        ),
    )
    assert firestore_trigger_mock.return_value.schedule.call_args[1] == {
        'folkeregisteridentifikator': '01234567890'
    }
