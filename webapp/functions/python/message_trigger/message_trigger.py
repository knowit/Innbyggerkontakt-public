# pylint: disable=W0613
"""Message trigger."""
import json
import os
import uuid
from posixpath import join as urljoin

import firebase
from gcp import utils

from models.bulletin import Bulletin
from models.message_model import Attributes, CloudTask, Event
from models.template_application import TemplateApplication


def message_trigger(event, context):
    """
    Message trigger.

    Triggered by recipients pubsub-message when recipients is done.
    Creates tasks for message module.

    Attributes:
        event: dict = {
            attributes: {
                bulletin_id: str,
                organization_id: str,
                bulletin_type: str,
                status: Optional[Status] = None,
                trace_string: str
            },
            data: "base64"
    }
    """
    bulletin_id = event['attributes']['bulletin_id']
    organization_id = event['attributes']['organization_id']
    event = Event(**event)
    org_ref = firebase.db.collection('organization').document(organization_id)
    bulletin_ref = (
        org_ref.collection('bulletin')
        .document('active')
        .collection(event.attributes.bulletin_type)
        .document(bulletin_id)
    )
    bulletin = Bulletin(**bulletin_ref.get().to_dict())
    template_application_document = org_ref.collection('template_application').document(
        bulletin.template_application_id
    )
    template_application = TemplateApplication(
        **template_application_document.get().to_dict()
    )
    template_application.mailjet_template = (
        template_application_document.collection('mailjet_template_ids')
        .document(bulletin.template_application_style_id)
        .get()
        .to_dict()['id']
    )
    service_account_email = os.getenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT')
    add_to_queue(
        event=event,
        bulletin=bulletin,
        template_application=template_application,
        service_account_email=service_account_email,
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    )


def add_to_queue(
    event: Event,
    bulletin: Bulletin,
    template_application: TemplateApplication,
    service_account_email: str,
    bulletin_id: str,
    organization_id: str,
):
    """Add bulletin to message cloud task queue."""
    cloud_task = utils.CloudTasks(
        os.getenv('MESSAGE_QUEUE'), os.getenv('APP_ENGINE_REGION')
    )
    if event.attributes.bulletin_type == 'event':
        tasks = [
            CloudTask(
                identifiers=Attributes(**event.attributes.dict()),
                content=bulletin.content,
                template_application=template_application,
                sandbox_mode=bulletin.sandbox_mode,
                person=event.data,
                status=event.attributes.status,
            )
        ]
    elif event.attributes.bulletin_type == 'search':
        cloud_storage = utils.CloudStorage(os.getenv('GCLOUD_PROJECT'))
        bucket_paths = cloud_storage.list_files(event.data.path)
        task_files = [
            f for f in bucket_paths if f != 'metadata.json' and f[-5:] == '.json'
        ]
        tasks = [
            CloudTask(
                identifiers=Attributes(**event.attributes.dict()),
                content=bulletin.content,
                template_application=template_application,
                sandbox_mode=bulletin.sandbox_mode,
                file_path=urljoin(event.data.path, file),
            )
            for file in task_files
        ]
    for index, task in enumerate(tasks):
        headers = {'Content-Type': 'application/json'}
        body = {
            'index': index,
            'total': len(tasks),
            'data': task.dict(exclude_none=True),
        }
        cloud_task.add_to_queue(
            os.getenv('MESSAGE_URL'),
            headers=headers,
            body=json.dumps(body),
            service_account_email=service_account_email,
            name=f'{organization_id}-{bulletin_id}-{uuid.uuid4().hex}',
        )
