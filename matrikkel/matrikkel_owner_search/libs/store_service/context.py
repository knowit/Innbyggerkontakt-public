"""Function to generate a context for matrikkel system version 4.5."""

from suds.client import Client


def get_client_matrikkel_context(store_service_client: Client):
    """Creates matrikkel context.

    Returns:
        ns0:MatrikkelContext: matrikkel context
    """
    matrikkel_context = store_service_client.factory.create('ns0:MatrikkelContext')
    snap_version = store_service_client.factory.create('ns0:Timestamp')
    snap_version.timestamp = '9999-01-01T00:00:00+01:00'
    matrikkel_context.locale = 'no_NO_B'
    matrikkel_context.brukOriginaleKoordinater = True
    matrikkel_context.koordinatsystemKodeId = {'value': 24}
    matrikkel_context.systemVersion = '4.5'
    matrikkel_context.klientIdentifikasjon = 'minKlient'
    matrikkel_context.snapshotVersion = snap_version

    return matrikkel_context
