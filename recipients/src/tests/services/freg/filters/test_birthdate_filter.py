from datetime import date

import pytest

from models.freg_model import Person
from models.query_model import Query
from services.freg.filters import birthdate_filter


@pytest.fixture()
@pytest.mark.usefixtures('get_test_person')
def default_person(get_test_person):
    person = Person(**get_test_person)
    birth = person.freg_person.birth[0]
    birth.are_ruling = True
    birth.date_of_birth = date(year=2000, month=6, day=15)
    return person


def test_empty_filter(default_person):
    response = birthdate_filter.filter_function(person=default_person, query=Query())
    assert response is True


def test_inside_date_of_birth(default_person):
    query = Query(date_of_birth_from='2000-6-14', date_of_birth_to='2000-6-16')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True


def test_same_date_of_birth(default_person):
    query = Query(date_of_birth_from='2000-6-15', date_of_birth_to='2000-6-15')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True


def test_younger_than_date_of_birth(default_person):
    query = Query(date_of_birth_from='2000-6-16', date_of_birth_to='2001-6-16')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_older_than_date_of_birth(default_person):
    query = Query(date_of_birth_from='1990-6-16', date_of_birth_to='2000-6-14')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_inside_year_of_birth(default_person):
    query = Query(year_of_birth_from=1990, year_of_birth_to=2010)

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True


def test_same_year_of_birth(default_person):
    query = Query(year_of_birth_from=2000, year_of_birth_to=2000)

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True


def test_younger_than_year_of_birth(default_person):
    query = Query(year_of_birth_from=2005, year_of_birth_to=2010)

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_older_than_year_of_birth(default_person):
    query = Query(year_of_birth_from=1980, year_of_birth_to=1995)

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_same_birth_date(default_person):
    query = Query(birth_date='2000-6-15')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True


def test_different_birth_date(default_person):
    query = Query(birth_date='2001-6-15')

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_missing_birth_object(default_person):
    query = Query(birth_date='2001-6-15')
    default_person.freg_person.birth = []

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is False


def test_missing_birth_object_no_date_query(default_person):
    query = Query()
    default_person.freg_person.birth = []

    response = birthdate_filter.filter_function(person=default_person, query=query)
    assert response is True
