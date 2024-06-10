from pytest import fixture

from models.message_model import Attributes, DataBatch, DataPerson, Event


@fixture
def attributes_dummy():
    return Attributes(
        bulletin_id='dummy-id',
        bulletin_type='search',
        organization_id='dummy-org-id',
        status='active',
        trace_string='???',
    )


@fixture
def databatch_dummy():
    return DataBatch(
        hits=99,
        path='dummy/path',
    )


@fixture
def data_person_dummy():
    return DataPerson(freg_identifier='1234', name='Daniel Dummesen', email='d@d.no')


def test_event_model_with_databatch(attributes_dummy, databatch_dummy):
    event_dictionary = {
        'attributes': attributes_dummy.dict(),
        'data': databatch_dummy.dict(),
    }
    event = Event(**event_dictionary)
    assert event is not None


def test_event_model_with_data_person(attributes_dummy, data_person_dummy):
    event_dictionary = {
        'attributes': attributes_dummy.dict(),
        'data': data_person_dummy.dict(),
    }
    event = Event(**event_dictionary)
    assert event is not None
