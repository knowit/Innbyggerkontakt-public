"""
Proxy/handler for cloud function.

Cloud function needs a main.py file with a handler function.
"""
import functions_framework
from cloudevents.http import CloudEvent

from freg_fetch_jobbid.main import start_uttrekk_jobb


@functions_framework.cloud_event
def handler(cloud_event: CloudEvent):
    """Simple handler for cloud function."""
    return start_uttrekk_jobb(cloud_event)
