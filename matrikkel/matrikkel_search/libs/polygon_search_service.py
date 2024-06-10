"""This is file contains functions for doing polygon searches on a specific municipality number and post processing of data."""
from typing import List

from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent
from suds.client import Client

from libs.matrikkel_enhet_service import (
    get_matrikkelenhet_sok_model,
    get_selection_polygons,
)


def polygon_search(
    search_event: MatrikkelSearchEvent, matrikkelenhet_client: Client, context
) -> List[str]:
    """This the main function for doing polygon searches on a specific municipality number.

    Args:
        search_event (MatrikkelSearchEvent): matrikkel search event.
        matrikkelenhet_client (Client): matrikkelenhet client (MatrikkelenhetServiceWS).
        context: Matrikkel context.

    Returns:
        List[str]: List of matrikkelenhet ids.
    """
    selection_polygons = get_selection_polygons(
        matrikkelenhet_client, search_event.polygons
    )
    sok_models = []

    for polygon in selection_polygons:
        sok_model = get_matrikkelenhet_sok_model(matrikkelenhet_client, search_event)
        sok_model.selectionPolygon = polygon
        sok_models.append(sok_model)

    results = []

    for sok_model in sok_models:
        result = matrikkelenhet_client.service.findMatrikkelenheter(sok_model, context)
        results.append(result)

    return _process_matrikkel_enhet_ids(results)


def _process_matrikkel_enhet_ids(id_lists: list) -> List[str]:
    """Process a list of matrikkel_enhet_ids."""
    ids = []

    for id_list in id_lists:
        for item in id_list.item:
            ids.append(str(item.value))

    return ids
