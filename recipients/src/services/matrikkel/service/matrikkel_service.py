"""
Matrikkel integration.

Exports
-------
MatrikkelService(bulletin_id: str, organization_id: str, municipality_number: str,
            span_context_header: str, bulletin_type: str)
    A service to interact with matrikkelen.
"""

import os
from datetime import datetime
from urllib.parse import urljoin

import pytz
from configs import matrikkel_config
from innbyggerkontakt import common, gcp

from models import query_model
from services.matrikkel.client.matrikkel_owner_client import MatrikkelOwnerClient
from services.matrikkel.oslo_reg_polygons import (
    BJERKE_SONE3,
    GRORUD_SONE4,
    NORDRE_AKER_SONE2,
    ROA1_SONE1,
    ROA2_SONE1,
    ROA3_SONE1,
    STOVNER_SONE4,
)


class MatrikkelService:
    """Matrikkel integration."""

    def __init__(
        self,
        bulletin_id: str,
        organization_id: str,
        municipality_number: str,
        bulletin_type: query_model.BulletinType = None,
    ):
        self._organization_id = organization_id
        self._municipality_number = municipality_number
        self._bulletin_type = bulletin_type
        self._path = f'matrikkel/{organization_id}/{bulletin_id}/'
        self._bulletin_id = bulletin_id

        self._cloud_storage = gcp.CloudStorage(os.getenv('GCLOUD_PROJECT'))

    def _upload_and_publish(self, metadata: dict, person_list: list):
        self._cloud_storage.upload_file_to_bucket(
            urljoin(self._path, 'metadata.json'), metadata
        )

        for index, batch in enumerate(
            common.divide_list(person_list, matrikkel_config.MATRIKKEL_BATCH_SIZE)
        ):
            file_name = matrikkel_config.MATRIKKEL_UTTREKK_FILE.format(index)
            self._cloud_storage.upload_file_to_bucket(
                urljoin(self._path, file_name), batch
            )

        hits = len(person_list)

        recipients_publisher = gcp.Publisher(os.getenv('RECIPIENTS_STATUS_TOPIC', ''))
        recipients_publisher.publish_message(
            data={'hits': hits, 'path': self._path},
            bulletin_id=self._bulletin_id,
            organization_id=self._organization_id,
            trace_string='',
            bulletin_type=query_model.BulletinType.SEARCH,
        )

        outcome_publisher = gcp.Publisher(os.getenv('OUTCOME_TOPIC', ''))
        outcome_publisher.publish_message(
            data={'hits': hits},
            bulletin_id=self._bulletin_id,
            organization_id=self._organization_id,
            trace_string='',
            type='recipients',
        )

    def add_cabin_owners(self, dry_run=False):
        """
        Get cabin owners in municipality.

        Uploads data to gcp-bucket.
        Publishes to message pubsub.
        Publishes to outcome pubsub.

        Args:
            dry_run (bool, optional): If True, not post pubsub messages (default is None). Defaults to False.

        Returns:
            dict[str, Any]: Metadata
        """
        cabin_owners = MatrikkelOwnerClient().get_cabin_owners(
            self._municipality_number
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(cabin_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, cabin_owners)

        return metadata

    def add_oslo_reg_roa(self, dry_run=False):
        """Get owners of buildings in polygon list based on building types and building statuses."""
        polygons = [ROA1_SONE1, ROA2_SONE1, ROA3_SONE1]

        building_owners = MatrikkelOwnerClient().get_building_owners_in_polygons(
            self._municipality_number, polygons
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(building_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, building_owners)

        return metadata

    def add_oslo_reg_bjerke(self, dry_run=False):
        """Get owners of buildings in polygon list based on building types and building statuses."""
        polygons = [BJERKE_SONE3]

        building_owners = MatrikkelOwnerClient().get_building_owners_in_polygons(
            self._municipality_number, polygons
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(building_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, building_owners)

        return metadata

    def add_oslo_reg_nordre_aker(self, dry_run=False):
        """Get owners of buildings in polygon list based on building types and building statuses."""
        polygons = [NORDRE_AKER_SONE2]

        building_owners = MatrikkelOwnerClient().get_building_owners_in_polygons(
            self._municipality_number, polygons
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(building_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, building_owners)

        return metadata

    def add_oslo_reg_grorud(self, dry_run=False):
        """Get owners of buildings in polygon list based on building types and building statuses."""
        polygons = [GRORUD_SONE4]

        building_owners = MatrikkelOwnerClient().get_building_owners_in_polygons(
            self._municipality_number, polygons
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(building_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, building_owners)

        return metadata

    def add_oslo_reg_stovner(self, dry_run=False):
        """Get owners of buildings in polygon list based on building types and building statuses."""
        polygons = [STOVNER_SONE4]

        building_owners = MatrikkelOwnerClient().get_building_owners_in_polygons(
            self._municipality_number, polygons
        )

        t_z = pytz.timezone('Europe/Oslo')

        hits = len(building_owners)

        metadata = {
            'query_date': t_z.localize(datetime.now()).isoformat(),
            'hits': hits,
        }

        if not dry_run:
            self._upload_and_publish(metadata, building_owners)

        return metadata
