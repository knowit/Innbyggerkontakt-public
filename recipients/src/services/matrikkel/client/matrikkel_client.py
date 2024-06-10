# pylint: disable=too-few-public-methods
"""
Matrikkel Client

Exports
--------
MatrikkelClient()
    A client used to make requests and fetch data from matrikkelen

"""
from configs import matrikkel_config
from innbyggerkontakt import gcp
from suds.client import Client


class MatrikkelClient:
    """A client used to make requests and fetch data from matrikkelen"""

    def __init__(self):
        _p, _u = gcp.get_secret('MATRIKKEL_PASSWORD'), gcp.get_secret(
            'MATRIKKEL_USERNAME'
        )

        self._kommune_client = Client(
            matrikkel_config.KOMMUNE_WSDL_URL, username=_u, password=_p
        )
        self._store_client = Client(
            matrikkel_config.STORE_WSDL_URL, username=_u, password=_p, timeout=600
        )
        self._bygg_client = Client(
            matrikkel_config.BYGG_WSDL_URL, username=_u, password=_p
        )
        self._adresse_client = Client(
            matrikkel_config.ADRESSE_WSDL_URL, username=_u, password=_p
        )
        self._matrikkelenhet_client = Client(
            matrikkel_config.MATRIKKEL_WSDL_URL, username=_u, password=_p
        )

        self._matrikkel_context = self.create_matrikkel_context()

    # Todo: bruk parametre til denne?
    def create_matrikkel_context(self):
        """Creates matrikkel context

        Returns:
            ns0:MatrikkelContext: matrikkel context
        """
        matrikkel_context = self._kommune_client.factory.create('ns0:MatrikkelContext')
        snap_version = self._kommune_client.factory.create('ns0:Timestamp')
        snap_version.timestamp = '9999-01-01T00:00:00+01:00'
        matrikkel_context.locale = 'no_NO_B'
        matrikkel_context.brukOriginaleKoordinater = True
        matrikkel_context.koordinatsystemKodeId = {'value': '24'}
        matrikkel_context.systemVersion = '3.10'
        matrikkel_context.klientIdentifikasjon = 'minKlient'
        matrikkel_context.snapshotVersion = snap_version

        return matrikkel_context

    # @add_span()
    def _get_objects_from_id_list(self, id_list):
        matrikkel_bubble_id_list = self._store_client.factory.create(
            'ns0:MatrikkelBubbleIdList'
        )
        matrikkel_bubble_id_list.item = id_list
        object_list = self._store_client.service.getObjects(
            matrikkel_bubble_id_list, self._matrikkel_context
        )
        return object_list
