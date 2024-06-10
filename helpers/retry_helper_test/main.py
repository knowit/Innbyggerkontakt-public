"""Module for cloudfunction."""
from time import sleep

import functions_framework
from cloudevents.http import CloudEvent

from retry_helper.main import retry


@retry(max_age_ms=60_000)
@functions_framework.cloud_event
def fail(cloudevent: CloudEvent):
    """A dummy function that always fail."""
    print(f'Got this cloudevent: {cloudevent}')
    sleep(5.0)
    return 1 / 0
