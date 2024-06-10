"""MML Services to help with uploading and downloading data."""
from os import getenv
from typing import List
from urllib.parse import urljoin

from fastapi import HTTPException
from innbyggerkontakt.firebase import db
from innbyggerkontakt.gcp import CloudStorage, Publisher
from innbyggerkontakt.models.person_list import PersonList

from models.query_model import BulletinType


GCLOUD_PROJECT = getenv('GCLOUD_PROJECT')
RECIPIENTS_STATUS_TOPIC = getenv('RECIPIENTS_STATUS_TOPIC')
OUTCOME_TOPIC = getenv('OUTCOME_TOPIC')


def upload_persons_and_metadata_to_cloud_storage(path, raw_person_list, metadata):
    """Upload person and metadata to cloudstorage."""
    cloud_storage = CloudStorage(GCLOUD_PROJECT)
    cloud_storage.upload_file_to_bucket(urljoin(path, 'metadata.json'), metadata)
    cloud_storage.upload_file_to_bucket(
        urljoin(path, 'manual-list.json'), raw_person_list
    )


class MMLService:
    """MML Services to help with uploading and downloading data."""

    def __init__(
        self,
        bulletin_id: str,
        organization_id: str,
        bulletin_type: BulletinType = BulletinType.SEARCH,
    ) -> None:
        self.bulletin_id = bulletin_id
        self.organization_id = organization_id
        self.bulletin_type = bulletin_type
        self._firebase_bulletin_ref = None

    def _get_bulletin_ref(self, active: bool = True):
        """Get correct bulletin ref.

        if active = True:
            Get bulletin from /organization/{organization_id}/bulletin/active/{bulletin_type}/{bulletin_id}
        else:
            Get bulletin from /organization/{organization_id}/bulletin/draft/default/{bulletin_id}
        """
        if active:
            _status = 'active'
            _status_collection = self.bulletin_type
        else:
            _status = 'draft'
            _status_collection = 'default'

        firebase_bulletin_ref = (
            db.collection('organization')
            .document(self.organization_id)
            .collection('bulletin')
            .document(_status)
            .collection(_status_collection)
            .document(self.bulletin_id)
        )
        return firebase_bulletin_ref

    def get_all_filters(self) -> List[str]:
        """Get all filter ids from current bulletin."""
        firebase_bulletin_ref = self._get_bulletin_ref()

        if not firebase_bulletin_ref.get().exists:
            raise HTTPException(status_code=404, detail='Bulletin not found')

        recipients = firebase_bulletin_ref.get(['recipients']).to_dict()
        return recipients['recipients']['manual']

    def _get_raw_persons(self, filter_id: str, cloud_storage):
        _path = f'mml/{self.organization_id}/{self.bulletin_id}/{filter_id}/manual-list.json'
        return cloud_storage.get_file_from_bucket(name=_path)

    def get_persons(self, filter_ids: List[str]) -> List:
        """Get persons from bucket according to list of filter ids."""
        cloud_storage = CloudStorage(GCLOUD_PROJECT)
        _persons_raw = []
        for filter_id in filter_ids:
            _persons_raw.extend(self._get_raw_persons(filter_id, cloud_storage))
        return PersonList.parse_obj({'persons': _persons_raw})

    def send_path_to_message_trigger(self, path: str, hits: int):
        """Upload PersonList of persons to message pub/sub."""
        publisher = Publisher(RECIPIENTS_STATUS_TOPIC)
        publisher.publish_message(
            data={'path': path, 'hits': hits},
            bulletin_id=self.bulletin_id,
            organization_id=self.organization_id,
            trace_string='',
            bulletin_type=self.bulletin_type,
        )

        outcome_publisher = Publisher(OUTCOME_TOPIC)
        outcome_publisher.publish_message(
            data={'hits': hits},
            bulletin_id=self.bulletin_id,
            organization_id=self.organization_id,
            trace_string='',
            type='recipients',
        )

    def get_filter_from_fs(self, filter_id) -> List:
        """Get persons from firestore."""
        if not self._firebase_bulletin_ref:
            self._firebase_bulletin_ref = self._get_bulletin_ref(active=False)

        firebase_mml_ref = self._firebase_bulletin_ref.collection(
            'manualRecipients'
        ).document(filter_id)

        if not firebase_mml_ref.get().exists:
            raise HTTPException(status_code=404, detail='Bulletin not found')

        return firebase_mml_ref.get().get('list')

    def delete_filter(self, filter_id):
        """Delete filter in Firestore reusing `_firebase_bulletin_ref`."""
        self._firebase_bulletin_ref.collection('manualRecipients').document(
            filter_id
        ).delete()

    def update_filter_metadata_path(self, filter_id: str, path: str):
        """Update bulletin->recipient->manual filter object with path."""
        bulletin_ref = self._get_bulletin_ref(active=False)
        filters_metadata = bulletin_ref.get().get('recipients').get('manual')
        _f_m_i = next(i for i, f in enumerate(filters_metadata) if f['id'] == filter_id)
        filters_metadata[_f_m_i]['path'] = path
        bulletin_ref.set({'recipients': {'manual': filters_metadata}}, merge=True)
