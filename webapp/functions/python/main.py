# pylint: disable=R0801,C0115,C0116,R0903,C0415
"""Webapp function."""
from enum import Enum

from cors import cors
from firebase import authenticate
from flask import current_app
from otel_setup import instrument_cloud_function
from pydantic import BaseModel


instrument_cloud_function(current_app)


def event_trigger(event, context):

    from event_trigger.event_trigger import event_trigger as et

    return et(event, context)


def message_trigger(event, context):
    from message_trigger.message_trigger import message_trigger as mt

    return mt(event, context)


def firestore_active_search(data, context):
    from firestore_trigger.firestore_trigger import firestore_active_search as fas

    return fas(data, context)


def firestore_active_search_deleted(data, context):
    from firestore_trigger.firestore_trigger import (
        firestore_active_search_deleted as fasd,
    )

    return fasd(data, context)


def firestore_active_event(data, context):
    from firestore_trigger.firestore_trigger import firestore_active_event as fae

    return fae(data, context)


def firestore_active_event_deleted(data, context):
    from firestore_trigger.firestore_trigger import (
        firestore_active_event_deleted as faed,
    )

    return faed(data, context)


def firestore_draft_manual_recipients(_data, context):
    from firestore_trigger.firestore_trigger import firestore_draft_mml_created

    return firestore_draft_mml_created(context)


def cron_job_delete_outdated_mml(_event, _context):
    """
    Delete outdated mml filters in draft.

    This is a wrapper for the CronJobTrigger.delete_outdated_mml_filter function.
    It is supposed to be triggered by Pub/Sub.

    Args:
         _event (dict):  The dictionary with data specific to this type of
                        event. The `@type` field maps to
                         `type.googleapis.com/google.pubsub.v1.PubsubMessage`.
                        The `data` field maps to the PubsubMessage data
                        in a base64-encoded string. The `attributes` field maps
                        to the PubsubMessage attributes if any is present.
         _context (google.cloud.functions.Context): Metadata of triggering event
                        including `event_id` which maps to the PubsubMessage
                        messageId, `timestamp` which maps to the PubsubMessage
                        publishTime, `event_type` which maps to
                        `google.pubsub.topic.publish`, and `resource` which is
                        a dictionary that describes the service API endpoint
                        pubsub.googleapis.com, the triggering topic's name, and
                        the triggering event type
                        `type.googleapis.com/google.pubsub.v1.PubsubMessage`.
    Returns:
        None. The output is written to Cloud Logging.
    """
    from cron_job_trigger.cron_job_trigger import delete_outdated_mml_filter

    return delete_outdated_mml_filter()


def scheduled_bulletin(request):
    from firestore_trigger.firestore_trigger import scheduled_bulletin as sb

    return sb(request)


def import_postal_codes(request):
    from import_postal_codes.import_postal_codes import import_postal_codes as ipc

    return ipc(request)


@cors
def send_test_http_trigger(request):
    from firestore_trigger.firestore_trigger import send_test_http_trigger as stht

    return stht(request)


def message_status_trigger(event, context):
    from message_status.message_status_trigger import message_status_trigger as mst

    return mst(event, context)


class Role(str, Enum):
    """Role, either 'admin' or 'bruker'."""

    ADMIN = 'admin'
    USER = 'bruker'


class User(BaseModel):
    """User."""

    user_id: str
    organization_id: str
    organization_role: Role


@cors
@authenticate(get_user_as_kwarg='firebase_user')
def recipients_presearch(request, firebase_user: User):
    from recipients_client.recipients_client import RecipientsClient

    return RecipientsClient(
        firebase_user.organization_id, request.path.split('/')[-1]
    ).request_presearch()
