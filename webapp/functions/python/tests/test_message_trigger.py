import json
from unittest.mock import patch

from message_trigger import message_trigger as mt
from mockfirestore import MockFirestore
from pytest import fixture

from models.bulletin import Bulletin
from models.message_model import Event
from models.template_application import TemplateApplication


BULLETIN_ID = 'test_bulletin'
ORGANIZATION_ID = 'test_organization'


@fixture
def pubsub_event_dict():
    with open('tests/mock_data/test_message_trigger_pubsub.json') as json_file:
        yield json.loads(json_file.read())


@fixture
def bulletin_dict():
    with open('tests/mock_data/test_bulletin_search.json') as json_file:
        yield json.loads(json_file.read())


@fixture
def template_application_dict():
    with open('tests/mock_data/test_template_application.json') as json_file:
        yield json.loads(json_file.read())


@patch('message_trigger.message_trigger.uuid', autospec=True)
@patch('message_trigger.message_trigger.utils', autospec=True)
def test_add_to_queue(
    utils_mock,
    uuid_mock,
    pubsub_event_dict,
    bulletin_dict,
    template_application_dict,
    monkeypatch,
):
    monkeypatch.setenv('MESSAGE_URL', 'https://www.message.com')
    uuid_mock.uuid4.return_value.hex = 'random_id'
    event = Event(**pubsub_event_dict['search_dummy'])
    bulletin = Bulletin(**bulletin_dict)
    template_application = TemplateApplication(**template_application_dict)
    utils_mock.CloudStorage.return_value.list_files.return_value = [
        '1.json',
        '2.json',
        'metadata.json',
    ]

    mt.add_to_queue(
        event,
        bulletin,
        template_application,
        'test_service_account',
        bulletin_id=BULLETIN_ID,
        organization_id=ORGANIZATION_ID,
    )

    assert utils_mock.CloudStorage.return_value.list_files.call_args[0] == (
        'test/path/',
    )
    assert utils_mock.CloudTasks.return_value.add_to_queue.call_count == 2
    assert (
        json.loads(
            utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[0][1]['body']
        )['data']['file_path']
        == 'test/path/1.json'
    )
    assert (
        utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[0][1]['name']
        == 'test_organization-test_bulletin-random_id'
    )
    assert (
        json.loads(
            utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[1][1]['body']
        )['data']['file_path']
        == 'test/path/2.json'
    )
    assert (
        utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[1][1]['name']
        == 'test_organization-test_bulletin-random_id'
    )


@patch('message_trigger.message_trigger.uuid', autospec=True)
@patch('message_trigger.message_trigger.utils', autospec=True)
def test_add_to_queue_attribute_single(
    utils_mock,
    uuid_mock,
    pubsub_event_dict,
    bulletin_dict,
    template_application_dict,
    monkeypatch,
):
    monkeypatch.setenv('MESSAGE_URL', 'https://www.message.com')
    uuid_mock.uuid4.return_value.hex = 'random_id'
    event = Event(**pubsub_event_dict['event_dummy'])
    bulletin = Bulletin(**bulletin_dict)
    template_application = TemplateApplication(**template_application_dict)

    mt.add_to_queue(
        event,
        bulletin,
        template_application,
        'test_service_account',
        bulletin_id=BULLETIN_ID,
        organization_id=ORGANIZATION_ID,
    )

    assert utils_mock.CloudTasks.return_value.add_to_queue.call_count == 1
    assert (
        json.loads(
            utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[0][1]['body']
        )['data']['person']['freg_identifier']
        == '01234567890'
    )
    assert (
        json.loads(
            utils_mock.CloudTasks.return_value.add_to_queue.call_args_list[0][1]['body']
        )['data']['person']['name']
        == 'Test Testersen'
    )
    assert (
        utils_mock.CloudTasks.return_value.add_to_queue.call_args[1]['name']
        == 'test_organization-test_bulletin-random_id'
    )


@patch('message_trigger.message_trigger.add_to_queue', autospec=True)
@patch('message_trigger.message_trigger.firebase', autospec=True)
def test_message_trigger_mml(
    firebase_mock,
    add_to_queue_mock,
    pubsub_event_dict,
    bulletin_dict,
    template_application_dict,
    monkeypatch,
):
    monkeypatch.setenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT', 'test_service_account')
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('search').document(BULLETIN_ID).set(bulletin_dict)
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
    event = pubsub_event_dict['mml_dummy']

    mt.message_trigger(event, None)
    event = Event(**event)
    bulletin = Bulletin(**bulletin_dict)  # TODO wait for test-data.
    template_application = TemplateApplication(**template_application_dict)
    template_application.mailjet_template = 0000000
    assert add_to_queue_mock.call_args[1] == {
        'event': event,
        'bulletin': bulletin,
        'template_application': template_application,
        'service_account_email': 'test_service_account',
        'bulletin_id': 'test_bulletin',
        'organization_id': 'test_organization',
    }


@patch('message_trigger.message_trigger.add_to_queue', autospec=True)
@patch('message_trigger.message_trigger.firebase', autospec=True)
def test_message_trigger(
    firebase_mock,
    add_to_queue_mock,
    pubsub_event_dict,
    bulletin_dict,
    template_application_dict,
    monkeypatch,
):
    monkeypatch.setenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT', 'test_service_account')
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('search').document(BULLETIN_ID).set(bulletin_dict)
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
    event = pubsub_event_dict['search_dummy']

    mt.message_trigger(event, None)
    event = Event(**event)
    bulletin = Bulletin(**bulletin_dict)
    template_application = TemplateApplication(**template_application_dict)
    template_application.mailjet_template = 0000000
    assert add_to_queue_mock.call_args[1] == {
        'event': event,
        'bulletin': bulletin,
        'template_application': template_application,
        'service_account_email': 'test_service_account',
        'bulletin_id': 'test_bulletin',
        'organization_id': 'test_organization',
    }


@patch('message_trigger.message_trigger.add_to_queue', autospec=True)
@patch('message_trigger.message_trigger.firebase', autospec=True)
def test_message_trigger_single(
    firebase_mock,
    add_to_queue_mock,
    pubsub_event_dict,
    bulletin_dict,
    template_application_dict,
    monkeypatch,
):
    monkeypatch.setenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT', 'test_service_account')
    mock_db = MockFirestore()
    mock_db.collection('organization').document(ORGANIZATION_ID).collection(
        'bulletin'
    ).document('active').collection('event').document(BULLETIN_ID).set(bulletin_dict)
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
    event = pubsub_event_dict['event_dummy']

    mt.message_trigger(
        event,
        None,
    )
    event = Event(**event)
    bulletin = Bulletin(**bulletin_dict)
    template_application = TemplateApplication(**template_application_dict)
    template_application.mailjet_template = 0000000
    assert add_to_queue_mock.call_args[1] == {
        'event': event,
        'bulletin': bulletin,
        'template_application': template_application,
        'service_account_email': 'test_service_account',
        'bulletin_id': 'test_bulletin',
        'organization_id': 'test_organization',
    }
    assert (
        firebase_mock.db.collection('organization')
        .document(ORGANIZATION_ID)
        .collection('bulletin')
        .document(BULLETIN_ID)
        .get()
    )
