import base64
from datetime import datetime

import pytest
from cloudevents.http import CloudEvent
from freezegun import freeze_time

from retry_helper.main import retry


@retry(max_age_ms=10_000)
@freeze_time('2022-01-01 12:00:01')
def my_cloudfunction(cloudevent: CloudEvent):
    return 1 / 0


attributes = {
    'type': 'com.example.sampletype1',
    'source': 'https://example.com/event-producer',
}
b64_data = base64.b64encode(b'{"JsonKey":"json_value"}')
data = {'message': {'data': b64_data}}


@pytest.fixture
@freeze_time('2022-01-01 12:00:00')
def fresh_cloud_event():
    return CloudEvent(attributes, data=data)


@pytest.fixture
@freeze_time('2022-01-01 10:00:00')
def old_cloud_event():
    return CloudEvent(attributes, data=data)


def test_fresh_error_should_cause_exception(fresh_cloud_event):
    with pytest.raises(ZeroDivisionError):
        my_cloudfunction(fresh_cloud_event)


def test_old_cloud_event_should_just_be_exited(old_cloud_event):
    print(datetime.now())
    assert my_cloudfunction(old_cloud_event) == 0
