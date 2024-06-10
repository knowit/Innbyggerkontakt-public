"""
Query generator.

Exports
-------
get_query_for_freg(queries: List[query_model.Query], municipality_number: str, residing_address: bool = False) - dict
    Returns the minimum common extraction filter for freg
"""
from itertools import groupby
from typing import List

from models import query_model


def get_query_for_freg(
    queries: List[query_model.Query],
    municipality_number: str,
    residing_address: bool = False,
) -> dict:
    """
    Return the minimum common extraction filter for freg.

    Parameters
    ----------
    queries: List[query_model.Query]
        List of queries to generate query
    municipality_number: str
        Municipality_number to use in query
    residing_address: bool, optional
        A flag specifying to use residing_address instead of residential_address (default is False)

    Returns
    -------
    dict
        A body for freg-extract requests
    """

    def get_item_if_all_equal(iterable):
        group = groupby(iterable)
        iterator = (element[0] for element in group)
        item = next(iterator, None)
        return item if not next(iterator, None) else None

    year_of_birth_from = get_item_if_all_equal(
        [query.year_of_birth_from for query in queries]
    )
    year_of_birth_to = get_item_if_all_equal(
        [query.year_of_birth_to for query in queries]
    )
    gender = get_item_if_all_equal([query.gender for query in queries])
    person_status_types = {
        status_type for query in queries for status_type in query.person_status_types
    }
    marital_status_type = get_item_if_all_equal(
        [
            element
            for query in queries
            if query.marital_status_types
            for element in query.marital_status_types
        ]
    )

    response = {
        'foedselsaarFraOgMed': year_of_birth_from,
        'foedselsaarTilOgMed': year_of_birth_to,
        'kjoenn': gender,
        'personstatustyper': list(person_status_types),
        'sivilstandstype': marital_status_type,
    }
    if not residing_address:
        response['kommunenummer'] = {'bostedskommunenummer': municipality_number}
    else:
        response['kommunenummer'] = {'oppholdskommunenummer': municipality_number}
    return response
