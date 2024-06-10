"""
Exports
-------
GcPClient(organization_id: str, bulletin_id: str)
    interact with gcp services on behalf of organization and bulletin
"""
import os
from enum import Enum
from posixpath import join as urljoin
from typing import List

from innbyggerkontakt import gcp

import freg_config
from models import freg_model


class BulletinType(Enum):
    """
    Represents either 'search' or 'event'.

    The bulletin type is search for freg and MML.
    Event-based filters are filters that are sent based on freg events.
    https://skatteetaten.github.io/folkeregisteret-api-dokumentasjon/hendelsesliste/
    """

    SEARCH = 'search'
    EVENT = 'event'


class GcpClient:
    """
    A class used to interact with gcp on behalf of organization and bulletin

    Attributes
    ----------
    organization_id: str
        The organization that interacts with gcp
    bulletin_id: str
        The current bulletin that is being processed

    Methods
    -------
    upload_persons(name: str, data: List[freg_model.Person])
        Upload needed freg data to cloud storage
    outcome(hits: int, trace_string: str)
        Publish current hits to outcome pubsub
    upload_metadata(matadata: dict)
        Upload metadata to cloud storage
    publish_status(hits: int, span_context: str, bulletin_type: str)
        Publish bulletin status to pubsub
    """

    def __init__(self, organization_id: str, bulletin_id: str):
        """
        Parameters
        ----------
        organization_id: str
            The organization that interacts with gcp
        bulletin_id: str
            The current bulletin that is being processed
        """
        self.organization_id = organization_id
        self.bulletin_id = bulletin_id
        self.__cloud_storage = gcp.CloudStorage(os.getenv('GCLOUD_PROJECT'))

    def __get_path(self):
        return freg_config.FREG_UTTREKK_PATH.format(
            self.organization_id, self.bulletin_id
        )

    def upload_persons(self, name: str, data: List[freg_model.Person]):
        """
        Upload data to storage bucket

        Parameters
        ----------
        name: str
            Name of uploaded file
        data: List[freg_model.Person]
            Persons to be uploaded

        Returns
        -------
        None
        """
        path = self.__get_path()
        file_name = freg_config.FREG_UTTREKK_FILE.format(name)
        self.__cloud_storage.upload_file_to_bucket(
            urljoin(path, file_name), [person.convert_to_storage() for person in data]
        )

    def outcome(self, hits: int):
        """
        Publish number of freg hits to pubsub OUTCOME_TOPIC

        Parameters
        ----------
        hits: int
            Number of hits for the bulletin-filter
        trace_string: str
            This bulletins logger trace_string

        Returns
        -------
        None
        """
        pubsub = gcp.Publisher(freg_config.OUTCOME_TOPIC)
        pubsub.publish_message(
            data={'hits': hits},
            bulletin_id=self.bulletin_id,
            organization_id=self.organization_id,
            type='recipients',
        )

    def upload_metadata(self, metadata: dict):
        """
        Upload metadata to metadata.json in cloud storage

        Parameters
        ----------
        metadata: dict
            The metadata to upload

        Returns
        -------
        None
        """
        metadata_path = urljoin(self.__get_path(), 'metadata.json')
        self.__cloud_storage.upload_file_to_bucket(metadata_path, metadata)

    def publish_status(
        self, bulletin_type: BulletinType, hits: int = None, person: dict = None
    ):
        """
        Publish bulletin status or person to pubsub.

        Parameters
        ----------
        bulletin_type: str
            The bulletin type, "search|event"
        hits: int
            Number of hits for the bulletin-filter, used if bulletin_type is 'search'
        person: dict
            If set: send this person as data, used if bulletin_type is 'event'
        Returns
        -------
        None
        """
        publisher = gcp.Publisher(freg_config.RECIPIENTS_STATUS_TOPIC)
        publisher.publish_message(
            data=person or {'hits': hits, 'path': self.__get_path()},
            bulletin_id=self.bulletin_id,
            organization_id=self.organization_id,
            bulletin_type=bulletin_type,
        )
