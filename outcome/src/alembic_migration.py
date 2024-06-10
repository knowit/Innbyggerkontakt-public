# pylint: disable-all
"""DB-migration."""
import argparse

import alembic.command
from alembic.config import Config


def migrate():
    """Run migration."""
    cmd_opts = argparse.Namespace(**{'raiseerr': True})

    config = Config(
        'alembic.ini', cmd_opts=cmd_opts, attributes={'configure_logger': False}
    )

    alembic.command.upgrade(config, 'head')
