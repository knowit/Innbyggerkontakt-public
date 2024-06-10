"""Function for fetching sms bucket data."""
import logging
import os

from google.cloud import storage
from lib.json_parser import json_parser


def get_phone_numbers(object_path: str):
    """Fetches object from sms bucket, decodes, parses to a model and returns the result."""
    bucket_name = os.getenv('GCP_PROJECT')
    storage_client = storage.Client()
    try:
        bucket = storage_client.get_bucket(bucket_name)
        blob = bucket.blob(object_path)
        content = blob.download_as_string()
        return json_parser(content)
    except RuntimeError as e:
        logging.exception('Error when fetching data object: %s', e)
        return
