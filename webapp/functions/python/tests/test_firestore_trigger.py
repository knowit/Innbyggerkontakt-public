import json
from datetime import datetime
from unittest.mock import patch

import recipients_client.recipients_client
from firestore_trigger import firestore_trigger as fst
from firestore_trigger.matrikkel.make_matrikkel_polygon_search_pubsub_call import (
    make_matrikkel_polygon_search_pubsub_call,
)
from mockfirestore import MockFirestore
from pytest import fixture
from recipients_client.recipients_client import RecipientsClient
from requests import Request

from models.bulletin import Bulletin, MMLFilter
from models.message_model import Event
from models.template_application import TemplateApplication


BULLETIN_ID = 'test_bulletin'
ORGANIZATION_ID = 'test_organization'
recipients_client.recipients_client.RECIPIENTS_URL = 'dummy'


@fixture
def bulletin_search_dict():
    with open('tests/mock_data/test_bulletin_search.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def bulletin_search_mml_dict():
    with open('tests/mock_data/test_firestore_trigger_mml.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def mml_filter_dict():
    with open('tests/mock_data/test_mml_filter.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def bulletin_event_dict():
    with open('tests/mock_data/test_bulletin_event.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def template_application_dict():
    with open('tests/mock_data/test_template_application.json', 'r') as json_file:
        yield json.loads(json_file.read())


@fixture
def bulletin_search_matrikkel_dict():
    with open(
        'tests/mock_data/test_firestore_trigger_matrikkel.json', 'r'
    ) as json_file:
        yield json.loads(json_file.read())


@fixture
def bulletin_search_kart_dict():
    with open('tests/mock_data/test_firestore_trigger_kart.json', 'r') as json_file:
        yield json.loads(json_file.read())


@patch('firestore_trigger.firestore_trigger.message_trigger', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_send_test(
    firebase_mock,
    message_trigger_mock,
    bulletin_search_dict,
    template_application_dict,
    monkeypatch,
):
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'template_application'
    ).document('test_template_application').set(template_application_dict)
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'template_application'
    ).document('test_template_application').collection('mailjet_template_ids').document(
        'default'
    ).set(
        {'id': 0000000}
    )
    firebase_mock.db = mock_db
    monkeypatch.setenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT', 'test_service_account')
    bulletin = Bulletin(**bulletin_search_dict)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.send_test(bulletin=bulletin, email='test@testersen.no')

    event = {
        'attributes': {
            'bulletin_id': BULLETIN_ID,
            'organization_id': ORGANIZATION_ID,
            'status': 'draft',
            'bulletin_type': 'event',
        },
        'data': {
            'freg_identifier': 'test',
            'name': 'test',
            'email': 'test@testersen.no',
        },
    }

    assert message_trigger_mock.add_to_queue.call_count == 1
    template_application = TemplateApplication(**template_application_dict)
    template_application.mailjet_template = 0000000
    assert message_trigger_mock.add_to_queue.call_args[1] == {
        'event': Event(**event),
        'bulletin': bulletin,
        'template_application': template_application,
        'service_account_email': 'test_service_account',
        'bulletin_id': BULLETIN_ID,
        'organization_id': ORGANIZATION_ID,
    }


@patch(
    'firestore_trigger.firestore_trigger.SCHEDULED_BULLETIN_URL',
    'https://www.scheduled-bulletin.com',
)
@patch('firestore_trigger.firestore_trigger.PROJECT_ID', 'test_project')
@patch('firestore_trigger.firestore_trigger.APP_ENGINE_REGION', 'test_region')
@patch(
    'firestore_trigger.firestore_trigger.RECIPIENTS_TRIGGER_SERVICE_ACCOUNT',
    'test_service_account',
)
@patch('firestore_trigger.firestore_trigger.scheduler')
@patch('firestore_trigger.firestore_trigger.uuid4')
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_event(
    firebase_mock, uuid4_mock, scheduler_mock, bulletin_event_dict, monkeypatch
):
    uuid4_mock.return_value.hex = 'random_id'
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('event').document(BULLETIN_ID).set(
        bulletin_event_dict
    )
    firebase_mock.db = mock_db
    bulletin = Bulletin(**bulletin_event_dict)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.event(bulletin)

    assert scheduler_mock.CloudSchedulerClient.return_value.create_job.call_count == 1
    assert scheduler_mock.CloudSchedulerClient.return_value.create_job.call_args[1] == {
        'request': {
            'parent': 'projects/test_project/locations/test_region',
            'job': {
                'name': (
                    'projects/test_project/locations/test_region/jobs/'
                    'test_organization-test_bulletin-random_id'
                ),
                'http_target': {
                    'http_method': 'POST',
                    'uri': 'https://www.scheduled-bulletin.com',
                    'body': json.dumps(
                        {
                            'organization_id': 'test_organization',
                            'bulletin_id': 'test_bulletin',
                            'type': 'event',
                        }
                    ).encode(),
                    'oidc_token': {'service_account_email': 'test_service_account'},
                },
                'schedule': '0 12 * * *',
                'time_zone': 'Europe/Oslo',
            },
        }
    }
    assert firebase_mock.db.collection('organization').document(
        ORGANIZATION_ID
    ).collection('bulletin').document('active').collection('event').document(
        BULLETIN_ID
    ).get().to_dict()[
        'execution'
    ][
        'cloudTaskOrScheduleId'
    ] == (
        'projects/test_project/locations/test_region/'
        'jobs/test_organization-test_bulletin-random_id'
    )


@patch('firestore_trigger.firestore_trigger.RecipientsClient', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_instant(
    firebase_mock,
    recipients_client_mock,
    bulletin_search_dict,
    template_application_dict,
):
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).set(
        {'municipalityNumber': '0000'}
    )
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'template_application'
    ).document('test_template_application').set(template_application_dict)
    firebase_mock.db = mock_db
    bulletin = Bulletin(**bulletin_search_dict)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.instant(bulletin)

    assert recipients_client_mock.return_value.request_search.call_count == 1
    assert recipients_client_mock.return_value.request_search.call_args[1] == {
        'local_variables': ['name'],
        'bulletin_type': 'search',
        'query': bulletin.recipients.query,
    }


@patch('firestore_trigger.firestore_trigger.RecipientsClient', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_instant_with_folkeregisteridentifikator(
    firebase_mock,
    recipients_client_mock,
    bulletin_search_dict,
    template_application_dict,
):
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).set(
        {'municipalityNumber': '0000'}
    )
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'template_application'
    ).document('test_template_application').set(template_application_dict)
    firebase_mock.db = mock_db
    bulletin = Bulletin(**bulletin_search_dict)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.instant(bulletin, folkeregisteridentifikator='01234567890')

    assert recipients_client_mock.return_value.request_single.call_count == 1
    assert recipients_client_mock.return_value.request_single.call_args[1] == {
        'folkeregisteridentifikator': '01234567890',
        'local_variables': ['name'],
        'query': bulletin.recipients.query,
    }


@patch(
    'firestore_trigger.firestore_trigger.SCHEDULED_BULLETIN_URL',
    'https://www.schedule-bulletin.com',
)
@patch(
    'firestore_trigger.firestore_trigger.SCHEDULE_BULLETIN_QUEUE',
    'schedule-bulletin-queue',
)
@patch(
    'firestore_trigger.firestore_trigger.RECIPIENTS_TRIGGER_SERVICE_ACCOUNT',
    'test_service_account',
)
@patch('firestore_trigger.firestore_trigger.uuid4', autospec=True)
@patch('firestore_trigger.firestore_trigger.utils', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_schedule(
    firebase_mock,
    utils_mock,
    uuid4_mock,
    bulletin_search_dict,
    monkeypatch,
):
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('search').document(BULLETIN_ID).set(
        bulletin_search_dict
    )
    firebase_mock.db = mock_db
    uuid4_mock.return_value.hex = 'random_id'

    bulletin = Bulletin(**bulletin_search_dict)
    schedule_time = datetime(year=2021, month=1, day=22, hour=12, minute=30)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.schedule(bulletin, schedule_time)

    assert utils_mock.CloudTasks.return_value.add_to_queue.call_count == 1
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_args[0] == (
        'https://www.schedule-bulletin.com',
    )
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_args[1] == {
        'body': '{"organization_id": "test_organization", "bulletin_id": "test_bulletin", '
        '"folkeregisteridentifikator": null, "type": "search"}',
        'service_account_email': 'test_service_account',
        'schedule_time': schedule_time,
        'name': f'{ORGANIZATION_ID}-{BULLETIN_ID}-random_id',
    }
    assert (
        firebase_mock.db.collection('organization')
        .document(ORGANIZATION_ID)
        .collection('bulletin')
        .document('active')
        .collection('search')
        .document(BULLETIN_ID)
        .get()
        .to_dict()['execution']['cloudTaskOrScheduleId']
        == f'{ORGANIZATION_ID}-{BULLETIN_ID}-random_id'
    )
    assert (
        firebase_mock.db.collection('organization')
        .document(ORGANIZATION_ID)
        .collection('bulletin')
        .document('active')
        .collection('search')
        .document(BULLETIN_ID)
        .get()
        .to_dict()['lastChangedBy']
        == 'server'
    )


@patch(
    'firestore_trigger.firestore_trigger.SCHEDULE_BULLETIN_QUEUE',
    'schedule-bulletin-queue',
)
@patch(
    'firestore_trigger.firestore_trigger.SCHEDULED_BULLETIN_URL',
    'https://www.schedule-bulletin.com',
)
@patch(
    'firestore_trigger.firestore_trigger.RECIPIENTS_TRIGGER_SERVICE_ACCOUNT',
    'test_service_account',
)
@patch('firestore_trigger.firestore_trigger.uuid4', autospec=True)
@patch('firestore_trigger.firestore_trigger.utils', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_schedule_folkeregister_identifikator(
    firebase_mock,
    utils_mock,
    uuid4_mock,
    bulletin_search_dict,
    monkeypatch,
):
    uuid4_mock.return_value.hex = 'random_id'

    bulletin = Bulletin(**bulletin_search_dict)
    schedule_time = datetime(year=2021, month=1, day=22, hour=12, minute=30)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.schedule(
        bulletin=bulletin,
        schedule_time=schedule_time,
        folkeregisteridentifikator='01234567890',
    )

    assert utils_mock.CloudTasks.return_value.add_to_queue.call_count == 1
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_args[0] == (
        'https://www.schedule-bulletin.com',
    )
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_args[1] == {
        'body': '{"organization_id": "test_organization", "bulletin_id": "test_bulletin", '
        '"folkeregisteridentifikator": "01234567890", "type": "search"}',
        'service_account_email': 'test_service_account',
        'schedule_time': schedule_time,
        'name': f'{ORGANIZATION_ID}-{BULLETIN_ID}-random_id',
    }
    assert firebase_mock.db.call_count == 0


def foo(x):
    y = json.loads(x)
    print(y)


@patch('tests.test_firestore_trigger.json', autospec=True)
def test_meta_delete_me(mock_json):
    mock_json.loads.return_value = 'returned'
    x = 'don\'t care'
    foo(x)


@patch('firestore_trigger.firestore_trigger.RecipientsClient', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_new_mmlfilter(fb_mock, recipients_client_mock, mml_filter_dict):
    fb_mock.db.collection().document().collection().document().collection().document().collection().document().get().to_dict.return_value = (
        mml_filter_dict
    )
    fb_mock.db.collection().document().collection().document().collection().document().collection().document().id = (
        'dummy_filter_id'
    )
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.draft_mml(filter_id='dummy_filter_id')
    recipients_client_mock.assert_called_once()


@patch('recipients_client.recipients_client.RecipientsClient', autospec=True)
@patch('recipients_client.recipients_client.requests', autospec=True)
def test_request_mml(request_mock, rc_mock, mml_filter_dict, bulletin_search_mml_dict):
    # bulletin = Bulletin(**bulletin_search_mml_dict)
    rc_mock.receiving_service_url = 'dummy-url'
    rc_mock.bulletin_id = 'dummy b id'
    rc_mock.receiving_service_url = 'dummy s URL'
    rc_mock.get_headers.return_value = {'a': 'dummy'}
    recipients = MMLFilter(**mml_filter_dict, id='dummy-filter-id')
    response = RecipientsClient.request_mml_upload(rc_mock, recipients=recipients)
    assert response is not None


@patch('firestore_trigger.firestore_trigger.utils', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_firestore_trigger_matrikkel(
    firebase_mock, utils_mock, bulletin_search_matrikkel_dict
):
    bulletin = Bulletin(**bulletin_search_matrikkel_dict)
    assert 'recipients' in bulletin.dict()
    assert 'matrikkel' in bulletin.dict()['recipients']
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    schedule_time = datetime(year=2021, month=1, day=22, hour=12, minute=30)
    firestore_trigger.schedule(bulletin, schedule_time)
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_count == 1


@patch('firestore_trigger.firestore_trigger.FirestoreTrigger.instant', autospec=False)
@patch('firestore_trigger.firestore_trigger.json', autospec=False)
@patch('firestore_trigger.firestore_trigger.utils', autospec=True)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
def test_firestore_trigger_matrikkel_scheduled(
    fb_mock,
    utils_mock,
    json_mock,
    instant_mock,
    bulletin_search_matrikkel_dict,
):
    json_mock.loads.return_value = bulletin_search_matrikkel_dict
    _c = fb_mock.db.collection().document().collection().document().collection()
    _c.document().get().to_dict.return_value = bulletin_search_matrikkel_dict
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    request_dummy = Request()
    firestore_trigger.scheduled(request=request_dummy)
    bulletin = Bulletin(**bulletin_search_matrikkel_dict)
    instant_mock.assert_called_once_with(
        bulletin=bulletin, bulletin_type='search', folkeregisteridentifikator=None
    )


# @pytest.mark.asyncio
# @patch('firestore_trigger.firestore_trigger.asyncio', autospec=True)
# @patch('firestore_trigger.firestore_trigger.RecipientsClient', autospec=True)
# @patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
# async def test_instant_with_matrikkel(
#     firebase_mock,
#     recipients_client_mock,
#     asyncio_mock,
#     bulletin_search_matrikkel_dict,
#     template_application_dict,
# ):
#     mock_db = MockFirestore()
#     mock_db.collection('organization').document(ORGANIZATION_ID).set(
#         {'municipalityNumber': '0000'}
#     )
#     mock_db.collection('organization').document(ORGANIZATION_ID).collection(
#         'template_application'
#     ).document('test_template_application').set(template_application_dict)
#     firebase_mock.db = mock_db
#     bulletin = Bulletin(**bulletin_search_matrikkel_dict)
#     firestore_trigger = fst.FirestoreTrigger(
#         bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
#     )
#     firestore_trigger.instant(bulletin=bulletin)
#     asyncio_mock.run.assert_called_once()
#     # assert (
#     #     recipients_client_mock.return_value.request_matrikkel_oslo_reg.call_count == 1
#     # )


@patch(
    'firestore_trigger.matrikkel.make_matrikkel_polygon_search_pubsub_call.make_matrikkel_polygon_search_pubsub_call'
)
@patch('firestore_trigger.firestore_trigger.firebase', autospec=True)
@patch(
    'firestore_trigger.matrikkel.make_matrikkel_polygon_search_pubsub_call.pubsub_v1.PublisherClient'
)
def test_instant_with_map(
    publisher_mock,
    firebase_mock,
    make_matrikkel_polygon_search_pubsub_call_mock,
    bulletin_search_kart_dict,
    template_application_dict,
):
    make_matrikkel_polygon_search_pubsub_call_mock.return_value = 'Mocked This Silly'

    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).set(
        {'municipalityNumber': '0000'}
    )
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'template_application'
    ).document('test_template_application').set(template_application_dict)
    firebase_mock.db = mock_db
    bulletin = Bulletin(**bulletin_search_kart_dict)
    firestore_trigger = fst.FirestoreTrigger(
        bulletin_id=BULLETIN_ID, organization_id=ORGANIZATION_ID
    )
    firestore_trigger.instant(bulletin=bulletin)

    publisher_mock().publish.assert_called_once()
    # TODO: why doesnt this work???
    # make_matrikkel_polygon_search_pubsub_call_mock.assert_called_once()


@patch(
    'firestore_trigger.matrikkel.make_matrikkel_polygon_search_pubsub_call.pubsub_v1.PublisherClient'
)
def test_make_matrikkel_polygon_search_pubsub_call(publisher_mock):
    # Arrange
    bulletin_id = 'test_bulletin_id'
    organization_id = 'test_organization_id'
    municipality_number = '0000'
    polygons = '{"type": "FeatureCollection", "features": []}'
    filter_id = 'test_filter_id'

    # Act
    make_matrikkel_polygon_search_pubsub_call(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
        municipality_number=municipality_number,
        polygons=polygons,
        filter_id=filter_id,
    )

    # Assert
    publisher_mock().publish.assert_called_once()
