"""Routes mml requests."""
from datetime import datetime

import pytz
from fastapi import APIRouter, Header, HTTPException
from innbyggerkontakt.models.person_list import PersonList

from models import query_model
from services.gcp_client import GcpClient
from services.mml.mml_service import (
    MMLService,
    upload_persons_and_metadata_to_cloud_storage,
)


router = APIRouter()


@router.post('/send/{bulletin_id}')
def mml_send(bulletin_id: str, organization_id: str = Header(...)):
    """
    Send MML lists from a bulletin.

    Downloads MML-lists from the GCP bucket
    and sends the whole list of people to Message pubsub.
    """
    # Step 1 Get all filter_ids from FS
    mml_service = MMLService(bulletin_id=bulletin_id, organization_id=organization_id)
    all_filters = mml_service.get_all_filters()
    all_filter_ids = [f['id'] for f in all_filters]
    if not all_filter_ids:
        raise HTTPException(status_code=404, detail='No filters found in bulletin')

    # Step 2 Download all filters from bucket
    person_list = mml_service.get_persons(filter_ids=all_filter_ids)
    if not person_list.persons:
        raise HTTPException(status_code=404, detail='Empty lists')

    # Step 3 Send the list to Message
    for path in [f['path'] for f in all_filters]:
        mml_service.send_path_to_message_trigger(
            path=path, hits=len(person_list.persons)
        )
    return f'Published {len(person_list.persons)} persons to message pubsub.'


@router.post('/clean-upload/{bulletin_id}/{filter_id}')
def mml_upload(
    bulletin_id: str,
    filter_id: str,
    organization_id: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """Upload the mml list to gcp and remove it from Firestore."""
    mml_service = MMLService(bulletin_id=bulletin_id, organization_id=organization_id)

    _raw_mml_list = mml_service.get_filter_from_fs(filter_id=filter_id)
    named_email_list = PersonList(persons=_raw_mml_list)
    t_z = pytz.timezone('Europe/Oslo')

    metadata = {
        'query_date': t_z.localize(datetime.now()).isoformat(),
        'persons_in_file': len(named_email_list.persons),
        'bulletin_type': bulletin_type,
    }
    path = f'mml/{organization_id}/{bulletin_id}/{filter_id}/'

    _raw_persons = [p.dict() for p in named_email_list.persons]
    upload_persons_and_metadata_to_cloud_storage(
        path=path, raw_person_list=_raw_persons, metadata=metadata
    )

    mml_service.update_filter_metadata_path(filter_id=filter_id, path=path)
    mml_service.delete_filter(filter_id)

    return metadata


def _publish_status(bulletin_id, organization_id, hits):
    gcp_client = GcpClient(organization_id=organization_id, bulletin_id=bulletin_id)
    gcp_client.publish_status(bulletin_type='search', hits=hits)
