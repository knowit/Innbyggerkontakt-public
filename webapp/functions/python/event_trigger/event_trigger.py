# pylint: disable=W0613,W0212
"""
Event trigger.

Triggerd by freg events published on pubsub.
Search for bulletins in firestore that match the freg event, then process them if exist
"""
from datetime import datetime

import firebase
import pytz
from dateutil.relativedelta import relativedelta
from firestore_trigger.firestore_trigger import FirestoreTrigger

from models.bulletin import Bulletin
from models.event_model import PubSubEvent


PERSON = '/freg/person/{bulletin_id}/{folkeregisteridentifikator}'


def event_trigger(event, context):
    """
    Event trigger.

    Triggerd by freg events published on pubsub.
    Search for bulletins in firestore that match the freg event, then process them if exist
    """
    docs = []

    event = PubSubEvent(**event)
    organization_ref = firebase.db.collection('organization')
    org = next(
        organization_ref.where(
            'municipalityNumber', '==', event.data.municipality_number
        ).stream(),
        None,
    )
    if org:
        docs = (
            org.reference.collection('bulletin')
            .document('active')
            .collection('event')
            .where('recipients.event.eventType', '==', event.attributes.event_type)
            .stream()
        )

    for firestore_bulletin in docs:
        organization = firestore_bulletin.reference._path[1]
        print(
            'log_text',
            f'bulletin_id: {firestore_bulletin.id}, organization_id: {organization}',
        )
        bulletin = Bulletin(**firestore_bulletin.to_dict())

        firestore_trigger = FirestoreTrigger(
            bulletin_id=firestore_bulletin.id, organization_id=organization
        )

        if bulletin.execution.delay:
            time = bulletin.execution.delay.split('/')
            tz = pytz.timezone('Europe/Oslo')
            schedule_time = tz.localize(datetime.now()) + relativedelta(
                hours=int(time[0]), days=int(time[1]), years=int(time[2])
            )
            firestore_trigger.schedule(
                bulletin,
                schedule_time,
                folkeregisteridentifikator=event.data.freg_identifier,
            )
        else:
            firestore_trigger.instant(
                bulletin, folkeregisteridentifikator=event.data.freg_identifier
            )

        # Discard firestore_trigger after use
        del firestore_trigger
