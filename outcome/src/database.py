"""Database configuration."""
import os

from innbyggerkontakt.gcp.utils import get_secret
from sqlalchemy import create_engine
from sqlalchemy.engine import url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


DB_PASS = os.getenv('DB_PASS', get_secret('OUTCOME_POSTGRES_PASSWORD'))
DB_USER = 'postgres'
DB_NAME = 'postgres'
DB_PORT = int(os.getenv('DB_PORT', '5432'))
DB_HOST = os.getenv('DB_CONNECTION_NAME')


URL = url.URL(
    drivername='postgres',
    username=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
    port=DB_PORT,
    host=DB_HOST,
)


engine = create_engine(
    URL, pool_size=10, max_overflow=20, connect_args={'options': '-c timezone=-02:00'}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
