import pytest

from models.freg_model import Person
from models.query_model import Query
from services.freg.filters import marital_status_type_filter


@pytest.fixture()
@pytest.mark.usefixtures("get_test_person")
def default_marital_status_type_person(get_test_person):
    person = Person(**get_test_person)
    marital_status_type = person.freg_person.marital_status[0]
    marital_status_type.are_ruling = True
    marital_status_type.marital_status = 'gift'
    return person


def test_empty_query(default_marital_status_type_person: Person):
    query = Query()
    response = marital_status_type_filter.filter_function(default_marital_status_type_person, query)
    assert response is True


def test_same_marital_status_type(default_marital_status_type_person: Person):
    query = Query(marital_status_types=['gift'])
    response = marital_status_type_filter.filter_function(default_marital_status_type_person, query)
    assert response is True


def test_different_marital_status_type(default_marital_status_type_person: Person):
    query = Query(marital_status_types=['ugift'])
    response = marital_status_type_filter.filter_function(default_marital_status_type_person, query)
    assert response is False
