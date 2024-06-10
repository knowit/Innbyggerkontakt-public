"""Gender filter"""
from models.query_model import Query
from models.freg_model import Person


def filter_function(person: Person, query: Query):
    """Return True if person match filter else return False"""

    gender_object = next((gender for gender in person.freg_person.gender if gender.are_ruling is True), None)
    response = True
    if query.gender:
        if not gender_object or gender_object.gender != query.gender:
            response = False

    return response
