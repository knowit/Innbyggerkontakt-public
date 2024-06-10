from innbyggerkontakt.models.basic_persons import EmailPerson, NamedPerson, PersonWithNameAndEmail
from innbyggerkontakt.models.person_list import PersonList


def test_create_manual_list_person_with_name_and_email():
    a_person = PersonWithNameAndEmail(name='Testy Testons', email='t@tmail.com')
    assert a_person.name == 'Testy Testons'
    assert a_person.email == 't@tmail.com'


def test_create_a_list_of_manual_persons():
    a_person = EmailPerson(email='ta@tmail.com')
    b_person = NamedPerson(name='Testy B Testons')
    c_person = PersonWithNameAndEmail(name='Charlie C Testson', email='c@c.com')
    person_list = PersonList(persons=[a_person, b_person, c_person])

    assert person_list is not None
    assert isinstance(a_person, EmailPerson)
    assert isinstance(b_person, NamedPerson)
    assert isinstance(c_person, PersonWithNameAndEmail)
    assert True
