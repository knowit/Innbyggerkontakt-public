from unittest import mock
from unittest.mock import call

import pytest
from cloudevents.http import CloudEvent
from ps_message.matrikkel_download_message import MatrikkelDownloadMessage


with mock.patch('otel_setup.instrument_cloud_function') as mock_logger:
    from main import download_matrikkel_data_job


@pytest.fixture
def cloud_event() -> CloudEvent:
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }

    b64_data = {
        'subscription': 'test-subscription',
    }

    return CloudEvent(attributes, b64_data)


@mock.patch('services.download_municipality_numbers')
@mock.patch('services.publish_to_pubsub')
def test_download_matrikkel_data_job(
    mock_publish_to_pubsub, mock_download_municipality_numbers, cloud_event
):
    mock_download_municipality_numbers.return_value = ['0000', '0001', '0002']

    download_matrikkel_data_job(cloud_event=cloud_event)

    calls = [
        call(
            topic='matrikkel-cron-job-download-data-function-topic',
            encoded_message=MatrikkelDownloadMessage(
                batch_number=0, from_matrikkel_id=0, municipality_number='0000'
            ).encode_for_pubsub(),  # type: ignore
        ),
        call(
            topic='matrikkel-cron-job-download-data-function-topic',
            encoded_message=MatrikkelDownloadMessage(
                batch_number=0, from_matrikkel_id=0, municipality_number='0001'
            ).encode_for_pubsub(),  # type: ignore
        ),
        call(
            topic='matrikkel-cron-job-download-data-function-topic',
            encoded_message=MatrikkelDownloadMessage(
                batch_number=0, from_matrikkel_id=0, municipality_number='0002'
            ).encode_for_pubsub(),  # type: ignore
        ),
    ]

    mock_download_municipality_numbers.assert_called_once()
    mock_publish_to_pubsub.assert_has_calls(calls)
