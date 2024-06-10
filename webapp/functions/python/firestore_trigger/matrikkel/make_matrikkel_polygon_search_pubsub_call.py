"""."""
import json
import os

import requests
from google.cloud import pubsub_v1
from ps_message.matrikkel_search_event.matrikkel_search import (
    MatrikkelSearchEvent,
    Polygon,
)

from models.geojson_model import GeoJsonModel


def make_matrikkel_polygon_search_pubsub_call(
    bulletin_id: str,
    organization_id: str,
    municipality_number: str,
    polygons: str,
    filter_id: str,
) -> requests.Response:
    """Do a kart query search, pubsub message to the matrikkel search module."""
    publisher = pubsub_v1.PublisherClient()
    project_id = os.getenv('GCLOUD_PROJECT')
    topic = os.getenv('MATRIKKEL_SEARCH_TOPIC')

    geojson_polygons = GeoJsonModel(**json.loads(polygons))
    polygons = [
        Polygon(ytreAvgrensning=f.geometry.coordinates[0])
        for f in geojson_polygons.features
    ]

    data = MatrikkelSearchEvent(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
        municipality_number=municipality_number,
        polygons=polygons,
        filter_id=filter_id,
    )
    topic_path = publisher.topic_path(project=project_id, topic=topic)

    future = publisher.publish(topic=topic_path, data=data.encode_for_pubsub())
    return future.result()
