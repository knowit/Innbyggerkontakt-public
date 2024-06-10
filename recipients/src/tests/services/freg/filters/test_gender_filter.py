import pytest

from models.freg_model import Person, Gender
from models.query_model import Query
from services.freg.filters import gender_filter


@pytest.fixture()
@pytest.mark.usefixtures("get_test_person")
def default_person(get_test_person):
    person = Person(**get_test_person)
    gender = person.freg_person.gender[0]
    gender.are_ruling = True
    gender.gender = Gender.InternalGender.WOMAN
    return person


def test_empty_filter(default_person):
    response = gender_filter.filter_function(person=default_person, query=Query())
    assert response is True


def test_inside_filter(default_person):
    response = gender_filter.filter_function(person=default_person, query=Query(gender='kvinne'))
    assert response is True


def test_outside_filter(default_person):
    response = gender_filter.filter_function(person=default_person, query=Query(gender='mann'))
    assert response is False


def test_missing_gender_object(default_person: Person):
    default_person.freg_person.gender = []
    response = gender_filter.filter_function(person=default_person, query=Query(gender='kvinne'))
    assert response is False
