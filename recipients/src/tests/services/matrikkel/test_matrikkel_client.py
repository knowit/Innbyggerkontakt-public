"""Testing matrikkel client"""
import os

import pytest

from services.matrikkel.client.matrikkel_owner_client import MatrikkelOwnerClient


TEST_POLYGONS = [
    [
        (10.644056797027588, 59.95103495662978),
        (10.646867752075195, 59.95249620539959),
        (10.640430450439453, 59.95722333358797),
        (10.644056797027588, 59.95103495662978),
    ],
    [
        (10.771408081054688, 59.93996605436876),
        (10.758533477783203, 59.92775373611061),
        (10.795269012451172, 59.92663548229322),
        (10.771408081054688, 59.93996605436876),
    ],
]
TEST_BUILDING_TYPES = [
    '111',
    '112',
    '113',
    '121',
    '122',
    '123',
    '124',
    '131',
    '133',
    '135',
    '136',
]
TEST_BUILDING_STATUSES = ['TB', 'FA', 'MB']
MUNICIPALITY_NUMBER_OSLO = '0301'


# @pytest.fixture(autouse=True)
# def default_matrikkel_client():
#     if (os.getenv('RUN_INTEGRATION_TEST') != 'TRUE'):
#         pytest.skip('Integration test')
#     matrikkel_building_client = MatrikkelClient()
#     yield matrikkel_building_client


@pytest.fixture(autouse=True)
def default_matrikkel_owner_client():
    if os.getenv('RUN_INTEGRATION_TEST') != 'TRUE':
        pytest.skip('Integration test')

    matrikkel_owner_client = MatrikkelOwnerClient()
    yield matrikkel_owner_client


def test_building_search(default_matrikkel_owner_client):
    municipality_number = '1151'  # utsira
    buildings = default_matrikkel_owner_client._building_search(
        municipality_number, ['161', '162', '163'], ['TB', 'FA', 'MB']
    )
    assert len(buildings.item) > 0


def test_get_cabin_owners(default_matrikkel_owner_client):
    owners = default_matrikkel_owner_client.get_cabin_owners('1151')
    assert len(owners) > 0
    assert isinstance(owners[0], str)
    assert len(owners[0]) == 11


def test_create_matrikkel_selection_polygon(default_matrikkel_owner_client):
    matrikkel_selection_polygon = (
        default_matrikkel_owner_client._create_matrikkel_selection_polygon(
            TEST_POLYGONS[0]
        )
    )
    positions = matrikkel_selection_polygon.polygon.ytreAvgrensning.positions.item

    assert matrikkel_selection_polygon.polygon
    assert positions[0].x == positions[-1].x and positions[0].y == positions[-1].y
    assert len(positions) == 4


def test_get_buildings_in_polygons(default_matrikkel_owner_client):
    buildings = default_matrikkel_owner_client._get_buildings_in_polygons(
        MUNICIPALITY_NUMBER_OSLO,
        TEST_POLYGONS,
        TEST_BUILDING_TYPES,
        TEST_BUILDING_STATUSES,
    )
    assert len(buildings) > 1


def test_building_search_polygon(default_matrikkel_owner_client):
    buildings = default_matrikkel_owner_client._building_search(
        MUNICIPALITY_NUMBER_OSLO,
        TEST_BUILDING_TYPES,
        TEST_BUILDING_STATUSES,
        TEST_POLYGONS[0],
    )

    assert buildings.item


def test_get_matrikkel_enheter_for_building_ids(default_matrikkel_owner_client):
    building_ids = default_matrikkel_owner_client._get_buildings_in_polygons(
        MUNICIPALITY_NUMBER_OSLO,
        TEST_POLYGONS,
        TEST_BUILDING_TYPES,
        TEST_BUILDING_STATUSES,
    )

    matrikkel_enheter = (
        default_matrikkel_owner_client._get_matrikkel_enheter_for_building_ids(
            building_ids
        )
    )

    assert len(matrikkel_enheter) > 0


def test_get_owners_for_matrikkel_enheter(default_matrikkel_owner_client):
    building_ids = default_matrikkel_owner_client._get_buildings_in_polygons(
        MUNICIPALITY_NUMBER_OSLO,
        TEST_POLYGONS,
        TEST_BUILDING_TYPES,
        TEST_BUILDING_STATUSES,
    )

    matrikkel_enheter = (
        default_matrikkel_owner_client._get_matrikkel_enheter_for_building_ids(
            building_ids
        )
    )

    owners = default_matrikkel_owner_client._get_owners_for_matrikkel_enheter(
        matrikkel_enheter
    )

    assert isinstance(owners[0], str)
    assert len(owners[0]) == 11
