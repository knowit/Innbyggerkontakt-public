"""Handles DB-queries."""
from typing import List

import sqlalchemy
from fastapi import HTTPException
from innbyggerkontakt import firebase
from sqlalchemy.orm import Session

from models.db.db_models import Bulletin, OrderBy, OrderDirection


def get_bulletin(db: Session, bulletin_id: str, user: firebase.User):
    """Return StatisticsResponse for bulletin."""
    result = (
        db.query(Bulletin)
        .filter(Bulletin.bulletin_id == bulletin_id)
        .filter(Bulletin.organization_id == user.organization_id)
        .one_or_none()
    )
    if not result:
        raise HTTPException(
            status_code=404, headers={'Cache-Control': 'private, no-store'}
        )
    return result


def get_bulletins(db: Session, bulletin_ids: List[str], user: firebase.User):
    """Return List[StatisticsResponse] for all bulletins in bulletin_ids."""
    results = (
        db.query(Bulletin)
        .filter(Bulletin.bulletin_id.in_(bulletin_ids))
        .filter(Bulletin.organization_id == user.organization_id)
        .all()
    )
    response = [{} for bulletin_id in bulletin_ids]
    for result in results:
        response[bulletin_ids.index(result.bulletin_id)] = result
    return response


def get_all_for_user(
    db: Session,
    user: firebase.User,
    page_size: int = 10,
    page: int = 1,
    order_by: OrderBy = OrderBy.DATETIME_CREATED,
    order_direction: OrderDirection = OrderDirection.DESC,
):
    """Return CollectionResponse for all bulletins in user organization."""
    result = (
        db.query(Bulletin)
        .filter(Bulletin.organization_id == user.organization_id)
        .order_by(getattr(sqlalchemy, order_direction)(order_by))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    total = (
        db.query(Bulletin)
        .filter(Bulletin.organization_id == user.organization_id)
        .count()
    )
    return {'page': page, 'page_size': page_size, 'total': total, 'data': result}


def delete_bulletins(db: Session, bulletin_ids: List[str], user: firebase.User):
    """Delete bulletins from db."""
    db.query(Bulletin).filter(Bulletin.bulletin_id.in_(bulletin_ids)).filter(
        Bulletin.organization_id == user.organization_id
    ).delete(synchronize_session=False)
    db.commit()
    return 'Bulletin deleted'
