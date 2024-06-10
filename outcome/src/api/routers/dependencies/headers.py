"""Header dependencies."""
# pylint: disable=E1101
from fastapi import Depends, Response


def handle_cache(response: Response):
    """Set cache control header."""
    response.headers['Cache-Control'] = 'private, no-store'


cache = Depends(handle_cache)
