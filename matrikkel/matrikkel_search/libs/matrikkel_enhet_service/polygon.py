"""Generates selection polygons for queries against the Matrikkel Api."""
from typing import List

from ps_message.matrikkel_search_event.matrikkel_search import Polygon
from suds.client import Client


def get_selection_polygons(matrikkelenhet_client: Client, polygons: List[Polygon]):
    """Generates selection polygons for queries against the Matrikkel Api."""
    selection_polygons = []

    for polygon in polygons:
        # ! No need for transformation if coordinates are in WGS84
        outer_point_list = matrikkelenhet_client.factory.create('ns13:PointList')

        for x, y in polygon.ytreAvgrensning:
            _p = matrikkelenhet_client.factory.create('ns13:Point')
            _p.x, _p.y, _p.z = x, y, 0
            outer_point_list.item.append(_p)

        inner_contraint = matrikkelenhet_client.factory.create('ns13:RingList')

        outer_contraint = matrikkelenhet_client.factory.create('ns13:Ring')
        outer_contraint.positions = outer_point_list

        _polygon = matrikkelenhet_client.factory.create('ns13:Polygon')
        _polygon.koordinatsystemKodeId = {'value': polygon.koordinatsystemKodeId}
        _polygon.ytreAvgrensning = outer_contraint
        _polygon.indreAvgrensning = inner_contraint

        selection_polygon = matrikkelenhet_client.factory.create(
            'ns13:SelectionPolygon'
        )
        selection_polygon.koordinatsystemKodeId = {
            'value': polygon.koordinatsystemKodeId
        }
        selection_polygon.polygon = _polygon

        selection_polygons.append(selection_polygon)

    return selection_polygons
