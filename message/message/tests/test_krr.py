from unittest import mock

from innbyggerkontakt.models.person_list import PersonList
from krr.krr import get_krr_persons
from tests.test_data import krr_persons  # noqa


@mock.patch('krr.krr.get_secret')
@mock.patch('krr.krr.Auth')
@mock.patch('krr.krr.AuthRequest')
def test_krr(mock_auth_request, mock_auth, mock_get_secret):
    personidentifikatorer = ['01234567890', '01234567891', '01234567892', '01234567893']
    default_language = 'nb'

    mock_auth_request.return_value.request.return_value.status_code = 200
    mock_auth_request.return_value.request.return_value.json.return_value = krr_persons
    person_list = get_krr_persons(personidentifikatorer, default_language, 'test')
    mock_auth_request.return_value.request.assert_called_once_with(
        'https://test-krr.no/rest/v1/personer',
        data={
            'personidentifikatorer': [
                '01234567890',
                '01234567891',
                '01234567892',
                '01234567893',
            ]
        },
        headers={'content-type': 'application/json'},
    )
    assert isinstance(person_list, PersonList)
    assert len(person_list.persons) == 4
