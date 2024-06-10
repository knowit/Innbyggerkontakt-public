# from unittest.mock import call, patch

import pytest
from freezegun import freeze_time
from innbyggerkontakt.monitoring import logger

from services.matrikkel.client.matrikkel_owner_client import MatrikkelOwnerClient
from services.matrikkel.service.matrikkel_service import MatrikkelService


@pytest.fixture()
def default_matrikkel_service(mock_gcp_cloud_storage, mock_gcp_publisher, mocker):
    mocker.patch.object(logger.GcpLogger, '__init__', lambda *args, **kwargs: None)
    mocker.patch.object(MatrikkelOwnerClient, '__init__', lambda *args, **kwargs: None)
    matrikkel = MatrikkelService(
        bulletin_id='test_bulletin_id',
        organization_id='test_organization_id',
        municipality_number='0000',
        bulletin_type='search',
    )
    yield matrikkel


@pytest.fixture(autouse=True)
def mock_gcp_publisher(mocker):
    mocker.patch(
        'services.matrikkel.service.matrikkel_service.gcp.Publisher', autospec=True
    )
    yield mocker


@pytest.fixture(autouse=True)
def mock_gcp_cloud_storage(mocker):
    mocker.patch(
        'services.matrikkel.service.matrikkel_service.gcp.CloudStorage', autospec=True
    )
    yield mocker


@pytest.fixture(autouse=True)
def mock_matrikkel_owner_client_get_cabin_owners(mocker):
    my_mock = mocker.patch(
        'services.matrikkel.client.matrikkel_owner_client.MatrikkelOwnerClient.get_cabin_owners',
        autospec=True,
    )

    my_mock.return_value = [
        '00000000000',
        '00000000001',
        '00000000002',
        '00000000003',
        '00000000004',
        '00000000005',
        '00000000006',
        '00000000007',
    ]
    yield my_mock


@pytest.fixture(autouse=True)
def mock_matrikkel_owner_client_get_building_owners_in_polygons(mocker):
    my_mock = mocker.patch(
        'services.matrikkel.client.matrikkel_owner_client.MatrikkelOwnerClient.get_building_owners_in_polygons',
        autospec=True,
    )

    my_mock.return_value = [
        '00000000000',
        '00000000001',
        '00000000002',
        '00000000003',
        '00000000004',
        '00000000005',
        '00000000006',
        '00000000007',
        '00000000008',
        '00000000009',
    ]

    yield my_mock


@pytest.fixture(autouse=True)
def mock_logger(mocker):
    mocker.patch('innbyggerkontakt.monitoring.logger.GcpLogger.log_text', autospec=True)
    mocker.patch(
        'innbyggerkontakt.monitoring.logger.GcpLogger.get_trace_string',
        return_value='test-string',
        autospec=True,
    )
    yield mocker


@freeze_time('2021-03-04')
def test_add_cabin_owners(default_matrikkel_service):
    response = default_matrikkel_service.add_cabin_owners()
    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 8,
    }


@freeze_time('2021-03-04')
def test_add_oslo_reg(default_matrikkel_service):
    response = default_matrikkel_service.add_oslo_reg_roa()

    assert response == {
        'query_date': '2021-03-04T00:00:00+01:00',
        'hits': 10,
    }
