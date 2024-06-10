"""Services used by cloud function."""
import os
from typing import List

import firebase_admin
from firebase_admin import firestore
from google.cloud import pubsub_v1


def download_municipality_numbers() -> List[str]:
    """Download municipality numbers from firestore.

    Returns:
        List[str]: list of municipality numbers
    """
    app = firebase_admin.initialize_app()
    db = firestore.client(app)

    organizations = db.collection('organization').stream()

    municipality_numbers = list(
        {
            org.to_dict()['municipalityNumber']
            for org in organizations
            if org.to_dict()['municipalityNumber'] != 'None'
        }
    )

    return municipality_numbers


def publish_to_pubsub(topic: str, encoded_message: str) -> str:
    """Publish to pubsub topic.

    Args:
        topic (str): the pubsub topic.
        encoded_message (str): utf-8 encoded message.

    Returns:
        str: result
    """
    project_id = os.environ.get('GCP_PROJECT')
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic)
    future = publisher.publish(topic_path, encoded_message)

    return future.result()
