"""Handle sql queries for bulletin table."""
from sqlalchemy.orm import Session

from models.db.db_models import Bulletin


def exist_or_register_bulletin(
    session: Session, bulletin_id, organization_id, **kwargs
):
    """Check if bulletin exist, if not create it."""
    instance = (
        session.query(Bulletin)
        .filter(Bulletin.bulletin_id == bulletin_id)
        .filter(Bulletin.organization_id == organization_id)
        .first()
    )
    if instance:
        return instance

    instance = Bulletin(
        bulletin_id=bulletin_id, organization_id=organization_id, **kwargs
    )
    session.add(instance)
    session.commit()
    session.refresh(instance)
    return instance
