# pylint: disable=R0911, R1705
"""Firestore trigger."""
import asyncio
import json
import os
from datetime import datetime
from uuid import uuid4

import firebase
import pytz
from firestore_trigger.matrikkel.make_matrikkel_polygon_search_pubsub_call import (
    make_matrikkel_polygon_search_pubsub_call,
)
from gcp import utils
from google.api_core.exceptions import NotFound
from google.cloud import scheduler
from message_trigger import message_trigger
from recipients_client.recipients_client import RecipientsClient
from recipients_client.sms_recipients_client import make_all_sms_calls

from models.bulletin import Bulletin, EventType, ExecutionType, LastChangedBy, MMLFilter
from models.message_model import Event
from models.template_application import TemplateApplication


SEARCH = '/freg/search/{bulletin_id}'
APP_ENGINE_REGION = os.getenv('APP_ENGINE_REGION')
RECIPIENTS_TRIGGER_SERVICE_ACCOUNT = os.getenv('RECIPIENTS_TRIGGER_SERVICE_ACCOUNT')
SCHEDULED_BULLETIN_URL = os.getenv('SCHEDULED_BULLETIN_URL')
SCHEDULE_BULLETIN_QUEUE = os.getenv('SCHEDULE_BULLETIN_QUEUE')
PROJECT_ID = os.getenv('GCLOUD_PROJECT')


def get_bulletin_type(raw_bulletin: dict):
    """
    Get the bulletin type.

    Bulletin used to be in
    "bulletin":{
        "type": "search"|"event"
    }
    Now they are on the form:
    "bulletin":{
        "channel" : {
            "name" : "sms" | "email",
            "type" : "search" | "event"
        }
    }
    In a transition period the bulletin will have both type and channel-type.
    This will return the type regardless of what form it is stored in.
    """
    if 'channel' in raw_bulletin:
        return raw_bulletin['channel']['type']
    elif 'type' in raw_bulletin:
        return raw_bulletin['type']
    else:
        raise ValueError


class FirestoreTrigger:
    """Handles bulletin events from firestore."""

    def __init__(
        self,
        *,
        bulletin_id,
        organization_id,
    ):
        self.bulletin_id = bulletin_id
        self.organization_id = organization_id

    def parse_firestore(  # noqa:  CCR001 Should be fixed, but not now
        self, data: dict
    ) -> dict:
        """Parse firestore data from firestore event trigger."""
        my_dict = {}
        basic_types = ['stringValue', 'integerValue', 'booleanValue', 'nullValue']
        types = ['mapValue', 'fields', 'arrayValue']
        for key, value in data.items():
            if key in basic_types:
                return value
            elif key == 'timestampValue':
                if 'Z' in value:
                    value = str(value).replace('Z', '+00:00')
                timezone = pytz.timezone('europe/oslo')
                return (
                    datetime.fromisoformat(value)
                    .replace(tzinfo=pytz.utc)
                    .astimezone(timezone)
                )
            elif key in types:
                return self.parse_firestore(value)
            elif key == 'values':
                return [self.parse_firestore(item) for item in value]
            my_dict.update({key: self.parse_firestore(value)})
        return my_dict

    def send_test(
        self, bulletin: Bulletin, email: str, name: str = None, status='draft'
    ):
        """Send test message to user."""
        service_account = os.getenv('MESSAGE_TRIGGER_SERVICE_ACCOUNT')
        if not name:
            name = email.split('@')[0]
        template_application_doc = (
            firebase.db.collection('organization')
            .document(self.organization_id)
            .collection('template_application')
            .document(bulletin.template_application_id)
        )
        template_application = TemplateApplication(
            **template_application_doc.get().to_dict()
        )
        template_application.mailjet_template = (
            template_application_doc.collection('mailjet_template_ids')
            .document(bulletin.template_application_style_id)
            .get()
            .to_dict()['id']
        )
        queue_event = {
            'attributes': {
                'bulletin_id': self.bulletin_id,
                'organization_id': self.organization_id,
                'status': status,
                'bulletin_type': 'event',
            },
            'data': {'freg_identifier': 'test', 'name': name, 'email': email},
        }
        message_trigger.add_to_queue(
            event=Event(**queue_event),
            bulletin=bulletin,
            template_application=template_application,
            service_account_email=service_account,
            bulletin_id=self.bulletin_id,
            organization_id=self.organization_id,
        )
        return 'OK', 200

    def demo(self, bulletin: Bulletin):
        """Send demo to last person who edited bulletin."""
        user = firebase.auth.get_user(bulletin.user_id) if bulletin.user_id else None
        if not user:
            return
        self.send_test(bulletin, user.email, status='active')

    def event(self, bulletin: Bulletin):
        """Process custom events."""
        if bulletin.recipients.event.event_type == EventType.ENDRING_I_ALDER:
            client = scheduler.CloudSchedulerClient()
            parent = f'projects/{PROJECT_ID}/locations/{APP_ENGINE_REGION}'
            name = (
                f'{parent}/jobs/{self.organization_id}-{self.bulletin_id}-{uuid4().hex}'
            )
            job = {
                'name': name,
                'http_target': {
                    'http_method': 'POST',
                    'uri': SCHEDULED_BULLETIN_URL,
                    'body': json.dumps(
                        {
                            'organization_id': self.organization_id,
                            'bulletin_id': self.bulletin_id,
                            'type': 'event',
                        }
                    ).encode(),
                    'oidc_token': {
                        'service_account_email': RECIPIENTS_TRIGGER_SERVICE_ACCOUNT
                    },
                },
                'schedule': '0 12 * * *',
                'time_zone': 'Europe/Oslo',
            }
            request = {'parent': parent, 'job': job}
            client.create_job(request=request)
            bulletin.execution.cloud_task_or_schedule_id = name
            bulletin.last_changed_by = LastChangedBy.SERVER
            firebase.db.collection('organization').document(
                self.organization_id
            ).collection('bulletin').document('active').collection('event').document(
                self.bulletin_id
            ).update(
                bulletin.dict(include={'execution', 'last_changed_by'}, by_alias=True)
            )
        return 'OK', 200

    def instant(  # noqa:  CCR001 Should be fixed, but not now
        self,
        bulletin: Bulletin,
        bulletin_type: str = 'search',
        folkeregisteridentifikator: str = None,
    ):
        """Start process instantly."""
        # If it is an sms bulletin
        if (
            bulletin.channel
            and bulletin.channel.name == 'sms'
            and bulletin.recipients.query
        ):
            make_all_sms_calls(
                bulletin=bulletin,
                bulletin_id=self.bulletin_id,
                organization_id=self.organization_id,
            )
            return 'OK', 200

        organization_ref = firebase.db.collection('organization').document(
            self.organization_id
        )
        template_application = TemplateApplication(
            **organization_ref.collection('template_application')
            .document(bulletin.template_application_id)
            .get()
            .to_dict()
        )
        municipality_number = organization_ref.get().to_dict()['municipalityNumber']
        recipients_client = RecipientsClient(
            organization_id=self.organization_id,
            bulletin_id=self.bulletin_id,
            municipality_number=municipality_number,
        )
        if folkeregisteridentifikator:
            recipients_client.request_single(
                folkeregisteridentifikator=folkeregisteridentifikator,
                local_variables=template_application.local_variables,
                query=bulletin.recipients.query,
            )
            if bulletin.sandbox_mode:
                self.demo(bulletin)
            return 'OK', 200
        if bulletin.recipients.query:
            recipients_client.request_search(
                local_variables=template_application.local_variables,
                query=bulletin.recipients.query,
                bulletin_type=bulletin_type,
            )
        if bulletin.recipients.manual:
            recipients_client.request_mml_send()

        if (
            bulletin.channel.name == 'email'
            and bulletin.recipients.matrikkel
            and bulletin.recipients.matrikkel[0].cabin_owners
        ):
            recipients_client.request_matrikkel_cabin_owners()

        if (
            bulletin.channel.name == 'email'
            and bulletin.recipients.kart
            and bulletin.recipients.kart[0].polygons
        ):
            # TODO: hvis flere kartfiltre: gjør et kall per
            for kart in bulletin.recipients.kart:
                make_matrikkel_polygon_search_pubsub_call(
                    bulletin_id=self.bulletin_id,
                    organization_id=self.organization_id,
                    municipality_number=municipality_number,
                    polygons=kart.polygons,
                    filter_id=kart.filter_id,
                )

        if bulletin.recipients.matrikkel and bulletin.recipients.matrikkel[0].oslo_reg:
            asyncio.run(recipients_client.request_matrikkel_oslo_reg())

        if bulletin.sandbox_mode:
            self.demo(bulletin)
        return 'OK', 200

    def schedule(
        self,
        bulletin: Bulletin,
        schedule_time: datetime,
        folkeregisteridentifikator: str = None,
    ):
        """Schedule a bulletin by creating a cloud task."""
        cloud_task = utils.CloudTasks(SCHEDULE_BULLETIN_QUEUE, APP_ENGINE_REGION)
        name = f'{self.organization_id}-{self.bulletin_id}-{uuid4().hex}'
        cloud_task.add_to_queue(
            SCHEDULED_BULLETIN_URL,
            body=json.dumps(
                {
                    'organization_id': self.organization_id,
                    'bulletin_id': self.bulletin_id,
                    'folkeregisteridentifikator': folkeregisteridentifikator,
                    'type': 'search',
                }
            ),
            service_account_email=RECIPIENTS_TRIGGER_SERVICE_ACCOUNT,
            schedule_time=schedule_time,
            name=name,
        )
        if not folkeregisteridentifikator:
            bulletin.execution.cloud_task_or_schedule_id = name
            bulletin.last_changed_by = LastChangedBy.SERVER
            firebase.db.collection('organization').document(
                self.organization_id
            ).collection('bulletin').document('active').collection('search').document(
                self.bulletin_id
            ).update(
                bulletin.dict(include={'execution', 'last_changed_by'}, by_alias=True)
            )
        return 'OK', 200

    def active_search(self, data, context):
        """Process new bulletins in bulletin/active/search firestore."""
        print(f'Function triggered by resource: {context.resource}')
        bulletin = Bulletin(**self.parse_firestore(data['value']['fields']))

        if bulletin.execution.type == ExecutionType.INSTANT:
            response = self.instant(bulletin=bulletin)
        elif bulletin.execution.type == ExecutionType.SCHEDULE:
            response = self.schedule(
                bulletin=bulletin, schedule_time=bulletin.execution.date_time
            )
        return response

    def active_search_deleted(self, data, context):
        """Process deleted bulletins in bulletin/active/search firestore."""
        print(f'Function triggered by resource: {context.resource}')

        old_values = data.get('oldValue', {}).get('fields')
        old_bulletin = Bulletin(**self.parse_firestore(old_values))
        if old_bulletin.execution.type == ExecutionType.SCHEDULE:
            cloud_tasks_client = utils.CloudTasks(
                SCHEDULE_BULLETIN_QUEUE, region=APP_ENGINE_REGION
            )
            try:
                cloud_tasks_client.delete_tasks_from_queue(
                    [old_bulletin.execution.cloud_task_or_schedule_id]
                )
            except NotFound:
                print(
                    f'Cloud task {old_bulletin.execution.cloud_task_or_schedule_id} '
                    'could not be deleted, 404 not found'
                )

    def active_event(self, data, context):
        """Process new bulletins in bulletin/active/event firestore."""
        print(f'Function triggered by resource: {context.resource}')

        bulletin = Bulletin(**self.parse_firestore(data['value']['fields']))
        return self.event(bulletin=bulletin)

    def active_event_deleted(self, data, context):
        """Process deleted bulletins in bulletin/active/event firestore."""
        print(f'Function triggered by resource: {context.resource}')

        old_values = data.get('oldValue', {}).get('fields')
        old_bulletin = Bulletin(**self.parse_firestore(old_values))
        if old_bulletin.recipients.event.event_type == EventType.ENDRING_I_ALDER:
            client = scheduler.CloudSchedulerClient()
            client.delete_job(name=old_bulletin.execution.cloud_task_or_schedule_id)

    def draft_mml(self, filter_id: str):
        """Triggered by new filter in draft."""
        municipality_number = (
            firebase.db.collection('organization')
            .document(self.organization_id)
            .get()
            .to_dict()['municipalityNumber']
        )

        recipients_client = RecipientsClient(
            organization_id=self.organization_id,
            bulletin_id=self.bulletin_id,
            municipality_number=municipality_number,
        )

        doc_ref = (
            firebase.db.collection('organization')
            .document(self.organization_id)
            .collection('bulletin')
            .document('draft')
            .collection('default')
            .document(self.bulletin_id)
            .collection('manualRecipients')
            .document(filter_id)
        )

        manual_filter = MMLFilter(**doc_ref.get().to_dict(), id=doc_ref.id)
        recipients_client.request_mml_upload(recipients=manual_filter)

    def scheduled(self, request):
        """Triggerd by scheduled event in cloud tasks Processes bulletin."""
        data = json.loads(request.data)
        print(f'Function triggered with bulletin_id: {self.bulletin_id}')
        print(f'and organization_id: {self.organization_id}')
        folkeregisteridentifikator = data.get('folkeregisteridentifikator')
        bulletin_type = get_bulletin_type(data)

        bulletin = (
            firebase.db.collection('organization')
            .document(self.organization_id)
            .collection('bulletin')
            .document('active')
            .collection(bulletin_type)
            .document(self.bulletin_id)
            .get()
            .to_dict()
        )
        if not bulletin:
            return None
        bulletin = Bulletin(**bulletin)
        return self.instant(
            bulletin=bulletin,
            bulletin_type=bulletin_type,
            folkeregisteridentifikator=folkeregisteridentifikator,
        )

    def send_test_http_trigger(self, request):
        """Process HTTP POST request for test emails."""
        bulletin = (
            firebase.db.collection('organization')
            .document(self.organization_id)
            .collection('bulletin')
            .document('draft')
            .collection('default')
            .document(self.bulletin_id)
            .get()
            .to_dict()
        )
        if not bulletin:
            return 'Bulletin not found', 404

        bulletin = Bulletin(**bulletin)
        data = request.get_json()

        for email in data['email_adresses']:
            self.send_test(bulletin, email=email)

        return 'ok', 200


def get_ids(context):
    """Get bulletin id and organization id.

    Context is the firestore path:
    "organization/{organization_id}/bulletin/active/event|search/{bulletin_id}"

    Return (bulletin_id, organization_id)
    """
    return context.resource.split('/')[-1], context.resource.split('/')[-5]


def get_ids_mml(context):
    """Get bulletin id, organization id and filter_id.

    Context is the firestore path:
    "organization/{organization_id}/bulletin/active/event|search/{bulletin_id}/ManuelR/{filter_id}"

    Return (filter_id, bulletin_id, organization_id)
    """

    return (context.resource.split('/')[i] for i in [-1, -3, -7])


def firestore_active_search(data, context):
    """Create and active search.

    Function triggered by new document in firestore
    "organization/{orgId}/bulletins/active/search/{bulletin_id}"
    data:
    https://cloud.google.com/functions/docs/calling/cloud-firestore#event_structure

    Returns FirestoreTrigger
    """
    bulletin_id, organization_id = get_ids(context)
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).active_search(data, context)


def firestore_active_search_deleted(data, context):
    """Delete a bulletin.

    Function triggered by deleted document in firestore
    "organization/{orgId}/bulletins/active/search/{bulletin_id}"
    data:
    https://cloud.google.com/functions/docs/calling/cloud-firestore#event_structure
    """
    bulletin_id, organization_id = get_ids(context)
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).active_search_deleted(data, context)


def firestore_active_event(data, context):
    """Triggers on event from freg.

    Function triggered by new document in firestore
    "organization/{orgId}/bulletins/active/event/{bulletin_id}"
    data:
    https://cloud.google.com/functions/docs/calling/cloud-firestore#event_structure
    """
    bulletin_id, organization_id = get_ids(context)
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).active_event(data, context)


def firestore_active_event_deleted(data, context):
    """Active event deleted.

    Function triggered by deleted document in firestore
    "organization/{orgId}/bulletins/active/event/{bulletin_id}"
    data:
    https://cloud.google.com/functions/docs/calling/cloud-firestore#event_structure
    """
    bulletin_id, organization_id = get_ids(context)
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).active_event_deleted(data, context)


def firestore_draft_mml_created(context):
    """Trigger that calls draft_mml."""
    filter_id, bulletin_id, organization_id = get_ids_mml(context)
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).draft_mml(filter_id)


def scheduled_bulletin(request):
    """Schedules a bulletin.

    Function triggered by http request, usually from SCHEDULE_QUEUE
    request.data: dict = {
        organization_id: str,
        bulletin_id: str,
        folkeregisteridentifikator: Optional[str] = None
    }
    """
    data = json.loads(request.data)
    organization_id = data.get('organization_id')
    bulletin_id = data.get('bulletin_id')
    return FirestoreTrigger(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
    ).scheduled(request)


@firebase.authenticate(get_user_as_kwarg='firebase_user')
def send_test_http_trigger(request, firebase_user: firebase.User = None):
    """Triggerd by HTTP POST request. Require authentication."""
    return FirestoreTrigger(
        bulletin_id=request.path.split('/')[-1],
        organization_id=firebase_user.organization_id,
    ).send_test_http_trigger(request)
