"""A function to generate a Matrikkelenhet service client."""
import os

from suds.client import Client

from libs.get_secret import get_secret


def get_matrikkelenhet_service_client():
    """A function to generate a Matrikkelenhet service client."""
    MATRIKKEL_URL = os.getenv('MATRIKKEL_ENDPOINT', '') + '/matrikkelapi/wsapi/v1'

    _u, _p = get_secret('MATRIKKEL_USERNAME'), get_secret('MATRIKKEL_PASSWORD')

    matrikkelenhet_client = Client(
        f'{MATRIKKEL_URL}/MatrikkelenhetServiceWS?WSDL', username=_u, password=_p
    )
    return matrikkelenhet_client
