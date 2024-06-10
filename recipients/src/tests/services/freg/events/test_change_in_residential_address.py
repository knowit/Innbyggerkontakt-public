import pytest

from models import freg_model
from services.freg.events import change_in_residential_address


@pytest.fixture()
def default_test_person(get_test_person):
    person = freg_model.Person(**get_test_person).freg_person
    person.residential_address[0].are_ruling = True
    person.residential_address[0].road_address.municipality_number = '0000'
    person.residential_address[1].are_ruling = False
    person.residential_address[1].road_address.municipality_number = '0001'
    yield person


def test_new_municipality(default_test_person):
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type == 'flyttingTilKommune'
    assert municipality_number == '0000'


def test_same_municipality(default_test_person):
    default_test_person.residential_address[1].road_address.municipality_number = '0000'
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type == 'flyttingInnenKommune'
    assert municipality_number == '0000'


def test_no_old_municipality(default_test_person):
    default_test_person.residential_address = [default_test_person.residential_address[0]]
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type == 'flyttingTilKommune'
    assert municipality_number == '0000'


def test_no_ruling_residential_address(default_test_person):
    default_test_person.residential_address[0].are_ruling = False
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type is None
    assert municipality_number is None


def test_no_new_municipality_number(default_test_person):
    default_test_person.residential_address[0].road_address = None
    default_test_person.residential_address[0].unknown_place_of_residence = None
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type is None
    assert municipality_number is None


def test_no_new_municipality_unknown_place_of_residence(default_test_person):
    default_test_person.residential_address[0].road_address = None
    default_test_person.residential_address[0].unknown_place_of_residence.municipality_number = '0000'
    event_type, municipality_number = change_in_residential_address.internal_event_type(default_test_person)

    assert event_type == 'flyttingTilKommune'
    assert municipality_number == '0000'
