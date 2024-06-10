import pytest

from models.freg_model import Person
from models.query_model import Query
from services.freg.filters import zip_code_filter


@pytest.fixture()
@pytest.mark.usefixtures("get_test_person")
def default_residential_person(get_test_person):
    person = Person(**get_test_person)
    residential_address = person.freg_person.residential_address[0]
    residential_address.are_ruling = True
    residential_address.road_address.post_office.zip_code = '1111'
    return person


@pytest.fixture()
@pytest.mark.usefixtures("get_test_person")
def default_residing_person(get_test_person):
    person = Person(**get_test_person)
    person.freg_person.residential_address = []
    residing_address = person.freg_person.residing_address[0]
    residing_address.are_ruling = True
    residing_address.road_address.post_office.zip_code = '1111'
    return person


def test_empty_query(default_residential_person: Person):
    response = zip_code_filter.filter_function(default_residential_person, Query())
    assert response is True


def test_residential_address_inside_filter(default_residential_person: Person):
    query = Query(zip_codes=['1110', '1111', '1112'])
    response = zip_code_filter.filter_function(default_residential_person, query)
    assert response is True


def test_residential_address_outside_filter(default_residential_person: Person):
    query = Query(zip_codes=['1110', '1112'])
    response = zip_code_filter.filter_function(default_residential_person, query)
    assert response is False


def test_residing_address_inside_filter(default_residing_person: Person):
    query = Query(zip_codes=['1110', '1111', '1112'], include_residing_address=True)
    response = zip_code_filter.filter_function(default_residing_person, query)
    assert response is True


def test_residing_address_outside_filter(default_residing_person: Person):
    query = Query(zip_codes=['1110', '1112'], include_residing_address=True)
    response = zip_code_filter.filter_function(default_residing_person, query)
    assert response is False
