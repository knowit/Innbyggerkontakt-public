"""Parses the json document to a list of strings."""
import logging
from typing import List

from msgspec.json import decode


def json_parser(content: str):
    """The function parses the json document to a list of strings, and measures time spent on the process."""
    try:
        result = decode(content, type=List[str])
        return result
    except RuntimeError as e:
        logging.exception('Error when parsing json: %s', e)
        return
