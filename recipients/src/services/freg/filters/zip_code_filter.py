"""Zip code filter"""
from models.query_model import Query
from models.freg_model import Person


def filter_function(person: Person, query: Query):
    """Return True if persons zip code match the filter else return False"""
    residential_address = next((address for address in person.freg_person.residential_address
                                if address.are_ruling is True), None)
    residing_address = next((address for address in person.freg_person.residing_address
                             if address.are_ruling is True), None)
    response = True

    if query.zip_codes:
        response = False
        try:
            response = residential_address.road_address.post_office.zip_code in query.zip_codes
        except AttributeError:
            response = False

        if query.include_residing_address and not response:
            try:
                response = residing_address.road_address.post_office.zip_code in query.zip_codes
            except AttributeError:
                response = False

    return response
