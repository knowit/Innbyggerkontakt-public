from unittest.mock import call

import pytest
from freezegun import freeze_time

from models.freg_model import Person
from models.query_model import Query
from services.freg import FregService


@pytest.fixture()
def default_freg_service():
    freg = FregService(
        bulletin_id='test_bulletin_id',
        organization_id='test_organization_id',
        municipality_number='0000',
        bulletin_type='search',
    )
    yield freg


@pytest.fixture(autouse=True)
def mock_gcp_client(mocker):
    my_mock = mocker.patch('services.freg.freg_service.gcp_client', autospec=True)
    yield my_mock.GcpClient.return_value


@pytest.fixture(autouse=True)
def mock_freg_client(mocker):
    my_mock = mocker.patch('services.freg.freg_service.freg_client', autospec=True)
    yield my_mock.FregClient.return_value


@pytest.fixture(autouse=True)
def mock_query_generator(mocker):
    yield mocker.patch('services.freg.freg_service.query_generator', autospec=True)


@pytest.fixture(autouse=True)
def mock_filter_function(mocker):
    yield mocker.patch('services.freg.freg_service.filter_function', autospec=True)


def fake_get_person_info(freg_identifiers: list, parts: list, default_person: dict):

    persons = []
    for freg_identifier in freg_identifiers:
        person = default_person.copy()
        foreldreansvar = default_person.copy()['folkeregisterperson']['foreldreansvar']

        for i in [0, 1]:
            foreldreansvar[i]['ansvarssubjekt'] = freg_identifier
            foreldreansvar[i]['ansvarlig'] = f'{freg_identifier}parent{i+1}'

        person['folkeregisterperson']['foreldreansvar'] = foreldreansvar
        person['foedselsEllerDNummer'] = freg_identifier
        person['folkeregisterperson']['identifikasjonsnummer'][0][
            'foedselsEllerDNummer'
        ] = freg_identifier

        person['folkeregisterperson'] = {
            key: person['folkeregisterperson'][key] for key in parts
        }
        persons.append(Person(**person))
    return persons


@pytest.fixture()
def setup(mock_freg_client, get_test_person, mock_filter_function):
    mock_freg_client.get_person_info.side_effect = (
        lambda freg_identifiers, parts: fake_get_person_info(
            freg_identifiers, parts, get_test_person
        )
    )
    mock_filter_function.return_value = True
    mock_freg_client.extract.side_effect = [
        [
            '00000000000',
            '00000000001',
            '00000000002',
            '00000000003',
            '00000000004',
            '00000000005',
            '00000000006',
            '00000000007',
        ],
        ['00000000008', '00000000009', '000000000010', '000000000011'],
    ]


@freeze_time('2021-03-04')
def test_search(default_freg_service, mock_gcp_client, setup):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(gender='mann', year_of_birth_from='1950', year_of_birth_to='1980'),
    ]
    results = [8, 8]

    response = default_freg_service.search(queries)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 8,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_called_once()
    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='search', hits=8
    )
    mock_gcp_client.outcome.assert_called_once_with(8)


@freeze_time('2021-03-04')
def test_search_with_parents(default_freg_service, mock_gcp_client, setup):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            find_parent=True,
        ),
    ]
    results = [8, 16]

    response = default_freg_service.search(queries)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 24,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_called_once()
    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='search', hits=24
    )
    mock_gcp_client.outcome.assert_called_once_with(24)


@freeze_time('2021-03-04')
def test_search_only_parents(default_freg_service, mock_gcp_client, setup):
    queries = [
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            find_parent=True,
        )
    ]
    results = [16]

    response = default_freg_service.search(queries)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 16,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_called_once()
    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='search', hits=16
    )
    mock_gcp_client.outcome.assert_called_once_with(16)


@freeze_time('2021-03-04')
def test_search_with_residing_address(default_freg_service, mock_gcp_client, setup):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            include_residing_address=True,
        ),
    ]
    results = [8, 12]

    response = default_freg_service.search(queries)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 12,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_called_once()
    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='search', hits=12
    )
    mock_gcp_client.outcome.assert_called_once_with(12)


@freeze_time('2021-03-04')
def test_search_with_residing_address_including_parents(
    default_freg_service, mock_gcp_client, setup
):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            include_residing_address=True,
            find_parent=True,
        ),
    ]
    results = [8, 24]

    response = default_freg_service.search(queries)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 32,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_called_once()
    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='search', hits=32
    )
    mock_gcp_client.outcome.assert_called_once_with(32)


@freeze_time('2021-03-04')
def test_search_with_known_freg_identifier(
    default_freg_service, mock_gcp_client, setup
):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(gender='mann', year_of_birth_from='1950', year_of_birth_to='1980'),
    ]
    results = [1, 1]
    default_freg_service.bulletin_type = 'event'
    response = default_freg_service.search(queries, freg_identifier=['00000000000'])
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 1,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='event',
        person={
            'freg_identifier': '00000000000',
            'name': 'Forståelsesfullblautoppblåst',
        },
    )
    mock_gcp_client.outcome.assert_called_once_with(1)


@freeze_time('2021-03-04')
def test_search_with_known_freg_identifier_including_residing_address(
    default_freg_service, mock_gcp_client, setup
):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            include_residing_address=True,
        ),
    ]
    results = [1, 1]
    default_freg_service.bulletin_type = 'event'
    response = default_freg_service.search(queries, freg_identifier=['00000000000'])
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 1,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.publish_status.assert_called_once_with(
        bulletin_type='event',
        person={
            'freg_identifier': '00000000000',
            'name': 'Forståelsesfullblautoppblåst',
        },
    )
    mock_gcp_client.outcome.assert_called_once_with(1)


@freeze_time('2021-03-04')
def test_search_with_known_freg_identifier_and_parents(
    default_freg_service, mock_gcp_client, setup
):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(
            gender='mann',
            year_of_birth_from='1950',
            year_of_birth_to='1980',
            find_parent=True,
        ),
    ]
    results = [1, 2]
    default_freg_service.bulletin_type = 'event'
    response = default_freg_service.search(queries, freg_identifier=['00000000000'])
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 3,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    assert mock_gcp_client.publish_status.call_count == 3
    mock_gcp_client.publish_status.assert_has_calls(
        [
            call(
                bulletin_type='event',
                person={
                    'freg_identifier': '00000000000',
                    'name': 'Forståelsesfullblautoppblåst',
                },
            ),
            call(
                bulletin_type='event',
                person={
                    'freg_identifier': '00000000000parent1',
                    'name': 'Forståelsesfullblautoppblåst',
                },
            ),
            call(
                bulletin_type='event',
                person={
                    'freg_identifier': '00000000000parent2',
                    'name': 'Forståelsesfullblautoppblåst',
                },
            ),
        ],
        any_order=True,
    )
    mock_gcp_client.outcome.assert_called_once_with(3)


@freeze_time('2021-03-04')
def test_search_with_presearch(default_freg_service, mock_gcp_client, setup):
    queries = [
        Query(gender='kvinne', year_of_birth_from='1980', year_of_birth_to='2000'),
        Query(gender='mann', year_of_birth_from='1950', year_of_birth_to='1980'),
    ]
    results = [8, 8]

    response = default_freg_service.search(queries, dry_run=True)
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 8,
        'queries': [
            {'result': result, 'query': query.dict()}
            for query, result in zip(queries, results)
        ],
    }

    mock_gcp_client.upload_persons.assert_not_called()
    mock_gcp_client.publish_status.assert_not_called()
    mock_gcp_client.outcome.assert_not_called()
