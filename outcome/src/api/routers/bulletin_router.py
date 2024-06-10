"""API router for bulletin-data."""
from typing import List, Union

from api.models.bulletin import CollectionResponse, StatisticsResponse
from api.repository import bulletin_repository
from api.routers.dependencies import auth, db
from fastapi import APIRouter, Depends, HTTPException, Query
from innbyggerkontakt import firebase
from sqlalchemy.orm import Session

from models.db.db_models import OrderBy, OrderDirection


router = APIRouter()


@router.get('/list', response_model=CollectionResponse, response_model_by_alias=True)
def get_statistics_collection(
    session: Session = Depends(db.get_db),
    user: firebase.User = Depends(auth.authorize),
    page_size: int = Query(10, gt=0),
    page: int = Query(1, gt=0),
    sort: OrderBy = OrderBy.DATETIME_CREATED,
    direction: OrderDirection = OrderDirection.DESC,
):
    """Return statistics for every bulletin in an organization."""
    return bulletin_repository.get_all_for_user(
        session,
        user,
        page_size=page_size,
        page=page,
        order_by=sort,
        order_direction=direction,
    )


@router.get(
    '/{bulletin_id}', response_model=StatisticsResponse, response_model_by_alias=True
)
def get_statistics_for_bulletin(
    bulletin_id: str,
    session: Session = Depends(db.get_db),
    user: firebase.User = Depends(auth.authorize),
):
    """Return statistics for a single bulletin."""
    return bulletin_repository.get_bulletin(session, bulletin_id, user)


@router.get(
    path='/',
    response_model=List[Union[StatisticsResponse, dict]],
    response_model_by_alias=True,
)
def get_statistics_for_bulletins(
    bulletin_ids: List[str] = Query(...),
    session: Session = Depends(db.get_db),
    user: firebase.User = Depends(auth.authorize),
):
    """Return statistics for bulletins."""
    return bulletin_repository.get_bulletins(session, bulletin_ids, user)


@router.delete('/delete')
def delete_statistics_for_bulletin(
    bulletin_id: List[str] = Query(...),
    session: Session = Depends(db.get_db),
    user: firebase.User = Depends(auth.authorize),
):
    """Delete all bulletins in list."""
    if user.organization_role != firebase.Role.ADMIN:
        raise HTTPException(status_code=401, detail='Not authorized')
    return bulletin_repository.delete_bulletins(session, bulletin_id, user)
