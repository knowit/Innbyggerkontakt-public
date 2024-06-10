"""Responsible for send api requests to Sinch."""
from flask import current_app
from otel_setup import instrument_cloud_function

from libs.cors import cors


instrument_cloud_function(current_app)


@cors
def send_test_sms(request):
    """This function pass the request to the sms handler function."""
    from libs.sms_handler import sms_handler

    return sms_handler(request)
