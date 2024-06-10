"""This is file contains functions for doing polygon searches on a specific municipality number and post processing of data."""
from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent

from libs.matrikkel_enhet_service import (
    get_client_matrikkel_context,
    get_matrikkelenhet_service_client,
)
from libs.owner_ids_service import get_owner_ids
from libs.polygon_search_service import polygon_search


def get_matrikkel_data(search_event: MatrikkelSearchEvent):
    """Get matrikkel data."""
    matrikkelenhet_client = get_matrikkelenhet_service_client()
    context = get_client_matrikkel_context(matrikkelenhet_client)

    matrikkel_enhet_ids = polygon_search(search_event, matrikkelenhet_client, context)
    print(f'Found {len(matrikkel_enhet_ids)} matrikkel enhet ids')
    owner_ids = get_owner_ids(search_event, matrikkel_enhet_ids)

    print(f'Found {len(owner_ids)} owner ids')

    return matrikkel_enhet_ids, owner_ids
