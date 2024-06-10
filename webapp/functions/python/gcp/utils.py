"""Common GCP utilities"""
import json
from datetime import datetime
from posixpath import join as urljoin
from typing import List, Union

import google.auth
from google.cloud import pubsub_v1, secretmanager, storage, tasks_v2
from google.protobuf import timestamp_pb2


PROJECT_ID = None


def get_project_id():
    """
    Gets the default project id
    :return: The current project id
    """
    global PROJECT_ID  # pylint: disable=global-statement
    if not PROJECT_ID:
        _, PROJECT_ID = google.auth.default()

    return PROJECT_ID


class Publisher:
    # pylint: disable=too-few-public-methods
    """pub/sub utility"""

    def __init__(self, topic_path: str):
        self.publisher = pubsub_v1.PublisherClient()
        self.topic_path = self.publisher.topic_path(
            get_project_id(), topic_path
        )  # pylint: disable=no-member

    def publish_message(self, data: dict, **kwargs):
        """Publish message to topic
        data: dict, data to publish
        **kwargs: {key: value} attributes in message"""
        self.publisher.publish(
            topic=self.topic_path, data=json.dumps(data).encode('utf-8'), **kwargs
        )


class CloudStorage:
    """Cloud storage utility
    bucket_name: str, bucket to operate on"""

    def __init__(self, bucket_name):
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(bucket_name=bucket_name)

    def get_file_from_bucket(self, name, as_json=True) -> Union[dict, str]:
        """Loads and returns json object from bucket"""
        blob = self.bucket.blob(blob_name=name)
        data = blob.download_as_text()
        if as_json:
            return json.loads(data)
        return data

    def upload_file_to_bucket(self, name: str, data: dict = None, text: str = None):
        """Upload dict as json object to bucket"""
        blob = self.bucket.blob(blob_name=name)
        string_to_upload = json.dumps(data, default=str) if data else text
        blob.upload_from_string(data=string_to_upload)

    def delete_folder(self, prefix: str):
        """Delete folder from bucket"""
        blobs = self.bucket.list_blobs(prefix=prefix)
        for blob in blobs:
            blob.delete()

    def list_files(self, prefix: str):
        """List all files in folder"""
        blobs = self.storage_client.list_blobs(
            bucket_or_name=self.bucket, prefix=prefix
        )
        return [blob.name.split('/')[-1] for blob in blobs]


class CloudTasks:
    """Utility for managing cloud tasks"""

    def __init__(self, queue: str, region: str):
        self.client = tasks_v2.CloudTasksClient()
        self.region = region
        self.queue = queue

    def add_to_queue(
        self,
        url: str,
        headers: dict = {},  # noqa: B006
        body: Union[str, dict] = None,
        schedule_time: datetime = None,
        service_account_email: str = None,
        name: str = None,
    ):
        """Add task to queue
        Set service_account_email to authenticate request to internal service"""
        http_method = 'GET'
        if body:
            http_method = 'POST'
        task = {
            'http_request': {'http_method': http_method, 'url': url, 'headers': headers}
        }

        if body:
            if isinstance(body, dict):
                body = json.dumps(body)
            task['http_request']['body'] = body.encode()

        if schedule_time:
            timestamp = timestamp_pb2.Timestamp()
            timestamp.FromDatetime(schedule_time)  # pylint: disable=no-member
            task['schedule_time'] = timestamp

        if service_account_email:
            task['http_request']['oidc_token'] = {
                'service_account_email': service_account_email
            }

        parent = self.client.queue_path(
            project=get_project_id(), location=self.region, queue=self.queue
        )
        if name:
            task['name'] = urljoin(parent, 'tasks', name)
        return self.client.create_task(parent=parent, task=task)

    def delete_tasks_from_queue(self, names: List[str]):
        """Delete tasks from queue"""
        for name in names:
            self.client.delete_task(
                name=self.client.task_path(
                    project=get_project_id(),
                    location=self.region,
                    queue=self.queue,
                    task=name,
                )
            )


def get_secret(secret_id, version_id='latest', decode=True):
    """Return secret from gcp secrets manager, set decode to false for files"""
    client = secretmanager.SecretManagerServiceClient()
    name = client.secret_version_path(
        project=get_project_id(), secret=secret_id, secret_version=version_id
    )
    response = client.access_secret_version(name=name)
    if decode:
        return response.payload.data.decode('UTF-8')
    return response.payload.data
