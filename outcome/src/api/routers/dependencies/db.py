"""Database dependencies."""
# pylint: disable=E1101
from database import SessionLocal


def get_db():
    """Yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
