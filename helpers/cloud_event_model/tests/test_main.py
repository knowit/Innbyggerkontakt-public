import base64
import json
from typing import Optional

import pytest
from cloudevents.http import CloudEvent

from cloud_event_model.cloud_event_model import JsonModel, to_camel


@pytest.fixture
def dummy_dict_obj():
    return {'name': 'Anders', 'age': 31}


@pytest.fixture
def json_b_string_dummy_obj(dummy_dict_obj):
    return json.dumps(dummy_dict_obj).encode('utf-8')


@pytest.fixture
def b64_encoded_dummy_obj(json_b_string_dummy_obj):
    return base64.b64encode(json_b_string_dummy_obj)


@pytest.fixture
def attributes():
    return {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }


@pytest.fixture
def data(b64_encoded_dummy_obj):
    return {
        'subscription': 'projects/test-project/subscriptions/my-subscription',
        'message': {
            'attributes': {'attr1': 'attr1-value'},
            'data': b64_encoded_dummy_obj,
            'messageId': 'message-id',
            'publishTime': '2021-02-05T04:06:14.109Z',
            'orderingKey': 'ordering-key',
        },
    }


@pytest.fixture
def cloud_event(attributes, data):
    return CloudEvent(attributes, data)


class MyTestModel(JsonModel):
    name: Optional[str]
    age: Optional[int]


@pytest.mark.parametrize(
    'test_string, expected',
    [
        ('no_problemo', 'noProblemo'),
        ('no_proBLemo', 'noProBLemo'),
        ('allreadyCamelCase', 'allreadyCamelCase'),
        ('CanITrickYouWithPascalCase', 'canITrickYouWithPascalCase'),
    ],
)
def test_camelcase(test_string, expected):
    assert expected == to_camel(test_string)


def assert_b64_encoded_json_are_the_same(*b64_strings: str):
    dicts = []
    for s in b64_strings:
        dicts.append(json.loads(base64.b64decode(s).decode('utf-8')))
    return all(x == dicts[0] for x in dicts)


def test_encode_for_pubsub(json_b_string_dummy_obj):
    dummy_object = MyTestModel(name='Anders', age=31)
    assert dummy_object.encode_for_pubsub() == json_b_string_dummy_obj


def test_convert_cloud_event_to_MessageModel(cloud_event):
    my_data = MyTestModel.from_cloud_event(cloud_event)
    assert my_data is not None
    assert my_data.message_id == 'message-id'
    assert my_data.name == 'Anders'
    assert my_data.age == 31
    assert my_data.attributes == {'attr1': 'attr1-value'}
    assert my_data.subscription == cloud_event.data['subscription']
