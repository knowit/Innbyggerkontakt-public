"""Marital status type filter"""
from models.query_model import Query
from models.freg_model import Person


def filter_function(person: Person, query: Query):
    """Return True if persons marital status type match the filter else return False"""
    if not query.marital_status_types:
        return True

    marital_status_types = next((marital_status for marital_status in person.freg_person.marital_status
                                if marital_status.are_ruling is True), None)

    if marital_status_types and marital_status_types.marital_status not in query.marital_status_types:
        return False

    return True
