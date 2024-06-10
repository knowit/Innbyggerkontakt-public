"""This file includes validation classes for fast JSON validation and parsing. Further, it has functions for downloading and uploading data to Google Cloud Storage."""
from typing import List

from ps_message.matrikkel_search_event.matrikkel_search import MatrikkelSearchEvent

from libs.bucket_services import get_matrikkel_enhets_data_from_bucket


def get_owner_ids(
    search_event: MatrikkelSearchEvent, matrikkel_enhet_ids: List[str]
) -> List[str]:
    """Get owner ids from matrikkel units.

    Downloads the matrikkel units from a municipality,
    and the polygon search's desired matrikkelenhet ID's
    from Google Cloud Storage.

    After processing the data, the function creates matrikkelenhet objects
    that includes the owner IDs.

    Args:
        search_event (MatrikkelSearchEvent): matrikkel search event.
        matrikkel_enhet_ids (list[str]): matrikkel enhet ids.

    Returns:
        List: list of
    """
    mapped_matrikkel_data = get_matrikkel_enhets_data_from_bucket(search_event)
    result = set([])  # As a set to only get unique ids

    for enhet_id in matrikkel_enhet_ids:
        owners = mapped_matrikkel_data.get(enhet_id)
        if owners is None:
            continue
        result.update(owners)

    return list(result)
