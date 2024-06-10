"""Handle freg events.

Exports
-------
FregEvents(organization_id: str)
    A class to interact with freg events
"""
import logging
import os
from itertools import groupby

from fastapi import HTTPException
from google.api_core.exceptions import NotFound
from innbyggerkontakt import gcp

import freg_config
from models import event_model
from services.freg import events
from services.freg.freg_client import FregClient


class FregEvents:
    """A class to interact with freg events.

    Methods
    -------
    event_feed()
        Process event feed from freg
    save_last_sequence()
        Saves last freg-event-feed sequence number. This will be used next time "event_feed()" is called
    """

    def __init__(self):
        # The following was removed for temporary multiple event feed fix
        # self.__freg_client = FregClient(organization_id=os.getenv('ORGANIZATION'))
        self.__cloud_storage = gcp.CloudStorage(os.getenv('GCLOUD_PROJECT'))
        self.__publisher = gcp.Publisher(freg_config.FREG_EVENT_TOPIC)

    def event_feed(self):  # noqa: CCR001
        """Process event feed from freg and publish events to pubsub.

        Returns
        -------
        int
            Last processed sequence number and last event sequence number from freg
        """
        try:
            lists_of_org_information = self.__cloud_storage.get_file_from_bucket(
                name=freg_config.LIST_OF_ORGANIZATIONS, as_json=True
            )
        except NotFound:
            raise HTTPException(
                status_code=404,
                detail=f'Document {freg_config.LIST_OF_ORGANIZATIONS} with organization data does not exist.',
            ) from NotFound

        _updated_last_sequence = 0

        for organization in lists_of_org_information:

            try:

                _sequence_number = self._publish_message_per_organization(organization)

                if _updated_last_sequence == 0:
                    _updated_last_sequence = _sequence_number

            except RuntimeError:
                continue

        self.__cloud_storage.upload_file_to_bucket(
            freg_config.GENERAL_LAST_SEQUENCE_LOCATION, text=str(_updated_last_sequence)
        )

        # For the temporary fix, the same file is reuploaded to not be automatically deleted after 30 days
        self.__cloud_storage.upload_file_to_bucket(
            name=freg_config.LIST_OF_ORGANIZATIONS, data=lists_of_org_information
        )

        return _updated_last_sequence

    def _publish_message_per_organization(self, organization):
        _freg_client = FregClient(organization_id=organization['name'])

        try:
            seq = int(
                self.__cloud_storage.get_file_from_bucket(
                    freg_config.LAST_SEQUENCE_LOCATION.format(
                        org_id=organization['name']
                    ),
                    as_json=False,
                )
            )
        except NotFound:
            try:
                seq = int(
                    self.__cloud_storage.get_file_from_bucket(
                        freg_config.GENERAL_LAST_SEQUENCE_LOCATION, as_json=False
                    )
                )
            except NotFound:
                seq = int(_freg_client.get_last_feed_sequence())

        freg_events = _freg_client.get_feed(seq)
        while freg_events:
            seq = self._process_freg_events(freg_events, _freg_client, organization)

            freg_events = _freg_client.get_feed(seq)

        # Uploading new last sequence location to organization doc
        self.__cloud_storage.upload_file_to_bucket(
            freg_config.LAST_SEQUENCE_LOCATION.format(org_id=organization['name']),
            text=str(seq),
        )

        return seq

    def _process_freg_events(  # noqa: CCR001
        self, freg_events, _freg_client, organization
    ):
        seq = freg_events[-1].sequence_number + 1
        freg_events.sort(key=lambda event: event.event.event_type)
        grouped_events = groupby(freg_events, key=lambda event: event.event.event_type)
        pubsub = []
        for event_type, events_of_type in grouped_events:
            if event_type != 'other':
                freg_identifiers = [
                    event.event.freg_identifier for event in events_of_type
                ]
                parts = {event_model.get_part_for_event_type(event_type), 'historikk'}
                persons = _freg_client.get_person_info(freg_identifiers, parts)
                for person in persons:
                    internal_event_type, municipality_number = events.get_event_type(
                        event_type, person.freg_person
                    )
                    if (
                        internal_event_type
                        and municipality_number
                        and (int(municipality_number) == int(organization['org_num']))
                    ):
                        pubsub.append(
                            {
                                'data': {
                                    'municipality_number': municipality_number,
                                    'freg_identifier': person.birth_or_d_number,
                                },
                                'event_type': internal_event_type,
                            }
                        )
        for message in pubsub:
            self.__publisher.publish_message(**message)
        logging.getLogger(__name__).info(
            "Added ['%d'] events to event queue ['%s'] from sequence range ['%d' - '%d']",
            len(pubsub),
            freg_config.FREG_EVENT_TOPIC,
            seq - len(freg_events),
            seq - 1,
        )

        return seq

    def save_last_sequence(self):
        """Save last freg-event-feed sequence number. This will be used next time "event_feed()" is called.

        Returns
        -------
        int
            Last freg-event-feed sequence number
        """
        try:
            list_of_orgs = self.__cloud_storage.get_file_from_bucket(
                freg_config.LIST_OF_ORGANIZATIONS, as_json=False
            ).splitlines()
        except NotFound:
            raise Exception(
                'Document with organization data does not exist'
            ) from NotFound

        org_used_to_get_last_element = list_of_orgs[0].split(',')[0]

        _freg_client = FregClient(organization_id=org_used_to_get_last_element)

        last_seq = _freg_client.get_last_feed_sequence()
        self.__cloud_storage.upload_file_to_bucket(
            freg_config.GENERAL_LAST_SEQUENCE_LOCATION, text=str(last_seq)
        )
        return last_seq
