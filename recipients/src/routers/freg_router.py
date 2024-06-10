"""Routing requets."""
from typing import List

from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse

from models import query_model
from services.freg import FregService
from services.freg.freg_events import FregEvents


router = APIRouter()


@router.post('/search/{bulletin_id}')
def freg_search(
    bulletin_id: str,
    filters: List[query_model.Query],
    municipality_number: str = Header(...),
    organization_id: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """Search freg for municipality_number and filters."""
    filters = filters or [query_model.Query()]
    return FregService(
        bulletin_id, organization_id, municipality_number, bulletin_type=bulletin_type
    ).search(filters)


@router.post('/presearch/{bulletin_id}')
def freg_presearch(
    bulletin_id: str,
    filters: List[query_model.Query],
    municipality_number: str = Header(...),
    organization_id: str = Header(...),
):
    """Do a presearch in freg for municipality_number and filters to get metadata."""
    filters = filters or [query_model.Query()]
    return FregService(bulletin_id, organization_id, municipality_number).search(
        filters, dry_run=True
    )


@router.post('/person/{bulletin_id}/{freg_identifier}')
def freg_person(
    bulletin_id: str,
    freg_identifier: str,
    filters: List[query_model.Query],
    municipality_number: str = Header(...),
    organization_id: str = Header(...),
    bulletin_type: query_model.BulletinType = Header(...),
):
    """Search freg for municipality_number and filters."""
    filters = filters or [query_model.Query()]
    return FregService(
        bulletin_id, organization_id, municipality_number, bulletin_type
    ).search(filters, freg_identifier=[freg_identifier])


@router.get('/event-feed/start')
def freg_event_feed():
    """Get all events from freg and publish supported events to pubsub."""
    return JSONResponse(
        status_code=200, content={'sequence_stop_number': FregEvents().event_feed()}
    )


@router.post('/event-feed/last-sequence')
def freg_event_save_last_sequence():
    """
    Get last event sequence from freg.

    Sequence number will be saved to bucket, this sequence will be
    used for freg_event_feed's next execution.
    """
    return JSONResponse(
        status_code=200,
        content={'sequence_stop_number': FregEvents().save_last_sequence()},
    )
