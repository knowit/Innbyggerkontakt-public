from datetime import datetime
from unittest import mock

from google.protobuf import timestamp_pb2

from innbyggerkontakt.gcp import utils


@mock.patch('innbyggerkontakt.gcp.utils.pubsub_v1', autospec=True)
def test_publisher_publish_message(pubsub_v1_mock):
    pubsub_v1_mock.PublisherClient.return_value.topic_path.return_value = 'test_project/topic_path'
    publisher = utils.Publisher('topic_path')
    publisher.publish_message({'test': 'data'}, attribute='attribute')

    assert pubsub_v1_mock.PublisherClient.return_value.publish.call_args[1] == {
        'topic': 'test_project/topic_path',
        'data': b'{"test": "data"}',
        'attribute': 'attribute'
    }


@mock.patch('innbyggerkontakt.gcp.utils.storage', autospec=True)
def test_cloud_storage_get_file_from_bucket(storage_mock):
    storage_mock.Client.return_value.bucket.return_value.blob.return_value.download_as_text.return_value = \
        '{"test": "data"}'
    cloud_storage = utils.CloudStorage('test_bucket')
    data = cloud_storage.get_file_from_bucket('test_file')

    assert data == {'test': 'data'}


@mock.patch('innbyggerkontakt.gcp.utils.storage', autospec=True)
def test_cloud_storage_upload_file_to_bucket(storage_mock):
    cloud_storage = utils.CloudStorage('test_bucket')
    cloud_storage.upload_file_to_bucket('test_name', {'test': 'data'})

    assert storage_mock.Client.return_value.bucket.return_value.blob.return_value.upload_from_string.call_args[1] == {
        'data': '{"test": "data"}'
    }


@mock.patch('innbyggerkontakt.gcp.utils.storage', autospec=True)
def test_cloud_storage_delete_folder(storage_mock):
    mock_1 = mock.MagicMock()
    mock_2 = mock.MagicMock()
    storage_mock.Client.return_value.bucket.return_value.list_blobs.return_value = [mock_1, mock_2]
    cloud_storage = utils.CloudStorage('test_bucket')
    cloud_storage.delete_folder('test/folder')

    assert mock_1.delete.call_count == 1
    assert mock_2.delete.call_count == 1


@mock.patch('innbyggerkontakt.gcp.utils.storage', autospec=True)
def test_cloud_storage_list_files(storage_mock):
    blob_1 = mock.MagicMock()
    blob_1.name = 'test/folder/blob_1'
    blob_2 = mock.MagicMock()
    blob_2.name = 'test/folder/blob_2'
    storage_mock.Client.return_value.list_blobs.return_value = [blob_1, blob_2]
    cloud_storage = utils.CloudStorage('test_bucket')
    files = cloud_storage.list_files('test/folder')

    assert files == ['blob_1', 'blob_2']


@mock.patch('innbyggerkontakt.gcp.utils.tasks_v2', autospec=True)
def test_cloud_tasks_add_to_queue(tasks_v2_mock):
    tasks_v2_mock.CloudTasksClient.return_value.queue_path.return_value = 'test_project/test_region/test_queue'
    schedule_time = datetime(year=2021, month=1, day=25, hour=13, minute=30)
    cloud_tasks = utils.CloudTasks('test_queue', 'test_region')
    cloud_tasks.add_to_queue('https://www.test.com', headers={'test': 'header'}, body={'test': 'body'},
                             schedule_time=schedule_time, service_account_email='test@service.com', name='test_name')

    assert tasks_v2_mock.CloudTasksClient.return_value.create_task.call_args[1] == {
        'parent': 'test_project/test_region/test_queue',
        'task': {
            'http_request': {
                'http_method': 'POST',
                'url': 'https://www.test.com',
                'headers': {
                    'test': 'header'
                },
                'body': b'{"test": "body"}',
                'oidc_token': {
                    'service_account_email': 'test@service.com'
                }
            },
            'schedule_time': timestamp_pb2.Timestamp(seconds=1611581400),
            'name': 'test_project/test_region/test_queue/tasks/test_name'
        }
    }


@mock.patch('innbyggerkontakt.gcp.utils.tasks_v2', autospec=True)
def test_cloud_tasks_delete_tasks_from_queue(tasks_v2_mock):
    cloud_tasks = utils.CloudTasks('test_queue', 'test_region')
    cloud_tasks.delete_tasks_from_queue(['task_1', 'task_2'])

    assert tasks_v2_mock.CloudTasksClient.return_value.delete_task.call_count == 2


@mock.patch('innbyggerkontakt.gcp.utils.secretmanager', autospec=True)
def test_get_secret(secretmanager_mock):
    utils.get_secret('test_secret')

    assert secretmanager_mock.SecretManagerServiceClient.return_value.access_secret_version.call_count == 1
