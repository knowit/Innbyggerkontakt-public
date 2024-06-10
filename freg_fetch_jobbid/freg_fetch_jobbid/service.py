"""This module is for all services used in fetch_recipients."""
import os

from google.cloud import pubsub_v1
from ps_message.freg_batch_getter import FregBatchGetter


def create_fetch_uttrekk_message(message_obj: FregBatchGetter):
    """Create a pubsub with jobb_id."""
    project_id = os.environ.get('GCP_PROJECT')
    topic_id = os.environ.get('PUBSUB_BATCH_TOPIC_ID')
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)
    future = publisher.publish(topic_path, message_obj.json().encode('utf-8'))
    return future
