"""Outcome pubsub listener."""
# pylint: disable=W0611

from alembic_migration import migrate
from google.cloud.logging_v2 import Client
from pubsub_listener.main import outcome_pubsub_listener  # noqa


client = Client()
client.get_default_handler()
client.setup_logging()

migrate()
