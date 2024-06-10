"""Mandatory main.py file for cloudfunction."""
import functions_framework
from cloudevents.http import CloudEvent

from delete_mailjet_contacts import run_auto_delete


@functions_framework.cloud_event
def run_auto_delete_handle(_cloud_event: CloudEvent):
    """Handle for cloud event."""
    return run_auto_delete()
