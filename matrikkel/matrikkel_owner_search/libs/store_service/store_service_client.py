"""This files includes the basic function for creating a Soap Client."""
import os

from suds.client import Client

from libs.get_secret import get_secret


def get_store_service_client() -> Client:
    """Get matrikkel store service suds client.

    Returns:
        Client: Store service client.
    """
    MATRIKKEL_URL = os.getenv('MATRIKKEL_ENDPOINT', '') + '/matrikkelapi/wsapi/v1'
    _u, _p = get_secret('MATRIKKEL_USERNAME'), get_secret('MATRIKKEL_PASSWORD')

    store_service_client = Client(
        f'{MATRIKKEL_URL}/StoreServiceWS?WSDL', username=_u, password=_p
    )
    return store_service_client
