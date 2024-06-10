import json

import pytest
from innbyggerkontakt.models.basic_persons import (EmailPerson, NamedPerson,
                                                   Person,
                                                   PersonWithNameAndEmail)
from innbyggerkontakt.models.person_list import PersonList
from pydantic import BaseModel, ValidationError


class NNIDPerson(NamedPerson):
    """Costum Person class."""

    nnid: str


class Dog(BaseModel):
    """Costum Non-Person class."""

    dog_name: str


def test_create_person_with_name_and_email():
    _p = PersonWithNameAndEmail(name='A A Testson', email='a@a.com')
    assert _p


def test_create_custom_person():
    _p = NNIDPerson(name='N N Testson', nnid='12354678901')
    assert _p


def test_auto_create_custom_person():
    _p = Person(name='N N Testson', nnid='12354678901')
    assert _p


def test_create_manual_list_person_with_name_and_email():
    a_person = PersonWithNameAndEmail(
        name='Testy Testons', email='t@tmail.com')
    assert a_person.name == 'Testy Testons'
    assert a_person.email == 't@tmail.com'


def test_create_a_list_of_manual_persons():
    a_person = EmailPerson(email='ta@tmail.com')
    b_person = NamedPerson(name='Testy B Testons')
    c_person = PersonWithNameAndEmail(
        name='Charlie C Testson', email='c@c.com')
    person_list = PersonList(persons=[a_person, b_person, c_person])

    assert person_list is not None
    assert isinstance(person_list.persons[0], EmailPerson)
    assert isinstance(person_list.persons[1], NamedPerson)
    assert isinstance(person_list.persons[2], PersonWithNameAndEmail)
    assert person_list.persons[2].email == 'c@c.com'


def test_create_a_list_of_a_non_person():
    dog = Dog(dog_name='Doggo')
    person_list = None
    with pytest.raises(ValidationError):
        person_list = PersonList(persons=[dog])
    assert not person_list


def test_create_a_list_of_custom_persons():
    a_person = NNIDPerson(name='Nadia Test', nnid='12345678901')

    person_list = PersonList(persons=[a_person])
    assert isinstance(person_list.persons[0], NNIDPerson)


def test_create_person_with_name_and_email_from_json():
    manual_list_email_and_name_persons_json_string = '''
    [
    {"name": "Anette Test Antonsen",
     "email": "a@a.com"
     },
    {
        "name": "Bengt Test Bengtson",
        "email": "b@b.com"
    },
    {
        "name": "Charlie Test Chess",
        "email": "c@c.com"
    }
    ]'''

    excpected_types = [NNIDPerson, PersonWithNameAndEmail]
    for e in excpected_types:
        try:
            persons = [e.parse_obj(p) for p in json.loads(
                manual_list_email_and_name_persons_json_string)]
        except Exception:
            continue
    assert persons is not None
    p_l = PersonList(persons=persons)
    assert len(p_l.persons) == 3
    assert all(isinstance(p, PersonWithNameAndEmail) for p in p_l.persons)
    assert p_l.persons[0].email == 'a@a.com'


def old_test_create_custom_model_from_json():
    custom_persons_json_string = '''
    [
    {"name": "Anette Test Antonsen",
     "nnid": "12345678901"
     },
    {
        "name": "Bengt Test Bengtson",
        "nnid": "12345678902"
    },
    {
        "name": "Charlie Test Chess",
        "nnid": "12345678903"
    }
    ]'''
    excpected_types = [NNIDPerson, PersonWithNameAndEmail]
    for e in excpected_types:
        try:
            persons = [e.parse_obj(p)
                       for p in json.loads(custom_persons_json_string)]
        except Exception:
            continue
    assert persons is not None
    p_l = PersonList(persons=persons)
    assert len(p_l.persons) == 3
    assert all(isinstance(p, NNIDPerson) for p in p_l.persons)
    assert p_l.persons[0].name == 'Anette Test Antonsen'
    assert p_l.persons[2].nnid == '12345678903'


def test_create_custom_model_from_json():
    custom_persons = [
        {
            'name': 'Anette Test Antonsen',
            'nnid': '12345678901'
        },
        {
            'name': 'Bengt Test Bengtson',
            'nnid': '12345678902'
        },
        {
            'name': 'Charlie Test Chess',
            'nnid': '12345678903'
        }
    ]

    p_l = PersonList(persons=custom_persons)
    assert len(p_l.persons) == 3
    assert p_l.persons[0].name == 'Anette Test Antonsen'
    assert p_l.persons[2].nnid == '12345678903'
    assert all(isinstance(p, NNIDPerson) for p in p_l.persons)
