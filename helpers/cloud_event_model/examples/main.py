"""Just an example on how to use in cloud function."""
from typing import Optional

import functions_framework
from cloudevents.http import CloudEvent

from cloud_event_model import JsonModel


class MyPersonModel(JsonModel):
    """Dummy Class."""

    name: Optional[str]
    age: Optional[int]


@functions_framework.cloud_event
def hello_cloud_event(cloud_event: CloudEvent):
    """Call the target method."""
    my_person = MyPersonModel.from_cloud_event(cloud_event)
    print(my_person)
