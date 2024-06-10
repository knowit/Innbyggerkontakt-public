# pylint: disable=too-few-public-methods, unsubscriptable-object
"""Matrikkel building client

Exports
-------
MatrikkelOwnerClient
    A client used to make requests and fetch data from matrikkelen
"""
from typing import List

from services.matrikkel.client.matrikkel_client import MatrikkelClient
from services.matrikkel.matrikkel_codes import (
    BUILDING_STATUS_CODES,
    FRITIDS_BUILDING_TYPE_CODES,
    LAWN_BUILDING_CODES,
)


class MatrikkelOwnerClient(MatrikkelClient):
    """A client used to make requests and fetch data from matrikkelen"""

    def get_cabin_owners(self, municipality_number):
        """Gets nnid of cabin owners in municipality.

        Args:
            municipality_number (string): municipality number.

        Returns:
            list[Dict]: list of dicts with nnid and name.
        """
        building_ids = self._building_search(
            municipality_number,
            list(FRITIDS_BUILDING_TYPE_CODES.values()),
            list(BUILDING_STATUS_CODES.values()),
        )

        matrikkel_enheter = self._get_matrikkel_enheter_for_building_ids(
            building_ids.item
        )
        matrikkel_enheter_owners = self._get_owners_for_matrikkel_enheter(
            matrikkel_enheter
        )

        return matrikkel_enheter_owners

    def get_building_owners_in_polygons(self, municipality_number, polygons):
        """gets building-owners from list of polygons

        Args:
            municipality_number (str): municipality number
            polygons (list): List of polygons

        Returns:
            list: list of person_ids of owners
        """
        building_types = list(LAWN_BUILDING_CODES.values())
        building_statuses = list(BUILDING_STATUS_CODES.values())

        building_ids = self._get_buildings_in_polygons(
            municipality_number, polygons, building_types, building_statuses
        )
        matrikkel_enheter = self._get_matrikkel_enheter_for_building_ids(building_ids)
        matrikkel_enheter_owners = self._get_owners_for_matrikkel_enheter(
            matrikkel_enheter
        )

        return matrikkel_enheter_owners

    def _get_owners_for_matrikkel_enheter(self, matrikkel_enheter: list):
        owners = []

        for m_e in matrikkel_enheter:
            if m_e.eierforhold:
                owners.extend(m_e.eierforhold.item)

        person_tinglyst_eierforhold_type = self._matrikkelenhet_client.factory.create(
            'ns28:PersonTinglystEierforhold'
        )
        eiere_tinglyst = [
            o for o in owners if isinstance(o, type(person_tinglyst_eierforhold_type))
        ]

        eier_ids = [e_t.eierId for e_t in eiere_tinglyst]
        eiere_objects = self._get_objects_from_id_list(eier_ids)

        fysisk_person_type = self._matrikkelenhet_client.factory.create(
            'ns32:FysiskPerson'
        )
        fysiske_eiere = [
            {'freg_identifier': eier.nummer, 'name': eier.fornavn.title()}
            for eier in eiere_objects.item
            if isinstance(eier, type(fysisk_person_type))
        ]

        return fysiske_eiere

    def _get_matrikkel_enheter_for_building_ids(self, building_ids: list):
        bygg_id_list = self._matrikkelenhet_client.factory.create('ns7:ByggIdList')
        bygg_id_list.item = building_ids
        matrikkelenheter = (
            self._matrikkelenhet_client.service.findMatrikkelenheterForByggList(
                bygg_id_list, self._matrikkel_context
            )
        )

        matrikkelenhet_ids = [m.value.item[0] for m in matrikkelenheter.entry]

        matrikkelenheter_objects = self._get_objects_from_id_list(matrikkelenhet_ids)

        return matrikkelenheter_objects.item

    def _get_buildings_in_polygons(
        self, municipality_number, polygons, building_types, building_statuses
    ):
        building_ids = []
        for polygon in polygons:
            buildings = self._building_search(
                municipality_number, building_types, building_statuses, polygon
            )
            try:
                building_objects = self._get_objects_from_id_list(buildings.item)
                building_type = self._bygg_client.factory.create('ns7:Bygning')

                filtered_buildings = [
                    building
                    for building in building_objects.item
                    if isinstance(building, type(building_type))
                ]
                filtered_building_ids = [building.id for building in filtered_buildings]
                building_ids.extend(filtered_building_ids)
            except AttributeError:
                continue
        return building_ids

    def _building_search(
        self,
        municipality_number: str,
        building_types_list: List[str],
        building_status_list: List[str],
        polygon: dict = None,
    ):
        byggsokmodel = self._bygg_client.factory.create('ns7:ByggsokModel')

        byggsokmodel.kommunenummer = municipality_number

        # limiting search to fritids-buildings
        string_list_building_types = self._bygg_client.factory.create('ns0:StringList')
        string_list_building_types.item = building_types_list
        byggsokmodel.bygningstypeListe = string_list_building_types

        # limiting search to "Bygning er tatt i bruk", "Ferdigattest" and "Midlertidig brukstillatelse"
        string_list_building_status = self._bygg_client.factory.create('ns0:StringList')
        string_list_building_status.item = building_status_list
        byggsokmodel.bygningsstatusListe = string_list_building_status

        if polygon:
            selection_polygon = self._create_matrikkel_selection_polygon(polygon)
            byggsokmodel.selectionPolygon = selection_polygon

        buildings = self._bygg_client.service.findBygg(
            byggsokmodel, self._matrikkel_context
        )

        return buildings

    def _create_matrikkel_selection_polygon(self, polygon):
        point_l = self._store_client.factory.create('ns13:PointList')

        for x_coordinate, y_coordinate in polygon:
            _point = self._store_client.factory.create('ns13:Point')

            _point.x, _point.y, _point.z = x_coordinate, y_coordinate, 0

            point_l.item.append(_point)

        indre_avgrensning = self._adresse_client.factory.create('ns13:RingList')
        ytre_avgrensning = self._adresse_client.factory.create('ns13:Ring')
        ytre_avgrensning.positions = point_l

        polygon = self._adresse_client.factory.create('ns13:Polygon')
        polygon.koordinatsystemKodeId = {'value': 24}
        polygon.ytreAvgrensning = ytre_avgrensning
        polygon.indreAvgrensning = indre_avgrensning

        selection_polygon = self._adresse_client.factory.create('ns13:SelectionPolygon')
        selection_polygon.koordinatsystemKodeId = {'value': 24}
        selection_polygon.polygon = polygon

        return selection_polygon
