"""Responsible for send api requests to Sinch."""
import functions_framework
from cloudevents.http import CloudEvent
from flask import current_app
from otel_setup import instrument_cloud_function


instrument_cloud_function(current_app)


@functions_framework.cloud_event
def send_sms(cloud_event: CloudEvent):
    """This function pass the trigger event to the sms handler function."""
    from lib.sms_handler import sms_handler

    return sms_handler(cloud_event)
