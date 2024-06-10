"""Abstract class to ease accessing data from Cloud Event."""
from __future__ import annotations

import base64
import json
from datetime import datetime
from typing import Dict, Optional, Type, TypeVar

from cloudevents.http import CloudEvent
from pydantic import BaseModel


def to_camel(maybe_camel_case: str) -> str:
    """Return a non-camelcase to camelCase."""
    pascal_case = ''.join(
        [w[0].upper() + w[1:] for w in maybe_camel_case.split('_') if w]
    )
    return pascal_case[0].lower() + pascal_case[1:]


T = TypeVar('T', bound='JsonModel')


class CloudEventModel(BaseModel):
    """A model for CloudEvent with pydantic."""

    attributes: Optional[Dict[str, str]]
    message_id: Optional[str]
    subscription: Optional[str]
    publish_time: Optional[datetime]
    ordering_key: Optional[str]
    data: Optional[str]

    class Config:
        """Config the pydantic class."""

        alias_generator = to_camel
        allow_population_by_field_name = True

    @classmethod
    def from_cloud_event(cls: Type[T], cloud_event: CloudEvent, **kwargs) -> T:
        """Generate a class as long as cloud_event message data is a json string."""
        kwargs.update(cloud_event.data['message'])
        kwargs['subscription'] = cloud_event.data['subscription']
        return cls(**kwargs)


class JsonModel(CloudEventModel):
    """
    Inherit from class and easily convert cloud events to pydantic models.

    Cloud_event message data has to be a byte64-encoded json string.

    ### Example:
    ```python
        from typing import Optional
        import functions_framework
        from cloudevents.http import CloudEvent
        from cloud_event_model import JsonModel

        class MyPersonModel(JsonModel):
            name: Optional[str]
            age: Optional[int]

        @functions_framework.cloud_event
        def hello_cloud_event(cloud_event: CloudEvent):
            my_person = MyPersonModel.from_cloud_event(cloud_event)
            print(my_person)
    ```
    """

    def encode_for_pubsub(self) -> str:
        """
        Make model ready for pubsub.

        Will return a b64 encoded json-string of the model.
        Remember that aliases are automatically aliased with camelCase.

        All None values are ignored.

        ### Example
        ```python
            my_dog = MyDog(soud='woof')
            publisher = pubsub_v1.PublisherClient()
            topic_path = publisher.topic_path(project_id, topic)
            future = publisher.publish(topic_path, my_dog.encode_for_pubsub())
        ```
        """
        return self.json(exclude_none=True).encode('utf-8')

    @classmethod
    def from_cloud_event(cls: Type[T], cloud_event: CloudEvent, **kwargs) -> T:
        """Generate a class as long as cloud_event message data is a json string."""
        json_string = base64.b64decode(cloud_event.data['message'].pop('data'))
        kwargs.update(json.loads(json_string.decode('utf-8')))
        return super().from_cloud_event(cloud_event=cloud_event, **kwargs)
