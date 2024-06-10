from unittest import mock

import pytest
from main import MatrikkelDownloadMessage
from matrikkel_models import MatrikkelEnhet, MatrikkelEnheter

import services


@pytest.mark.integration_test
def test_request_matrikkel_enheter_batch_element_tree():
    # 3025, 1151, 3413, 3801, 6414452787
    tree = services.request_matrikkel_enheter_batch_element_tree('1151', 0)
    assert tree


@pytest.mark.integration_test
def test_largest_id_and_length():
    # 3025, 1151, 3413, 3801
    tree = services.request_matrikkel_enheter_batch_element_tree('1151', 0)
    largest_id, length = services.largest_id_and_length(tree)
    assert largest_id
    assert length > 100


@pytest.mark.integration_test
def test_get_matrikkel_units_with_person_owners():
    # 3025, 1151, 3413, 3801
    tree = services.request_matrikkel_enheter_batch_element_tree('1151', 0)
    elements_with_owners = services.get_matrikkel_units_with_person_owners(tree)
    assert len(elements_with_owners) > 100


@pytest.mark.integration_test
def test_get_matrikkel_objects_from_tinglyste_eiendommer():
    # 3025, 1151, 3413, 3801
    tree = services.request_matrikkel_enheter_batch_element_tree('1151', 0)

    elements_with_owners = services.get_matrikkel_units_with_person_owners(tree)
    matrikkel_units_with_owners = services.create_matrikkel_enheter_list(
        elements_with_owners
    )
    assert len(matrikkel_units_with_owners.matrikkel_enheter_list) > 100


@mock.patch('services.storage.Client')
def test_update_matrikkel_data_in_storage(mock_storage_client):
    matrikkel_enheter = MatrikkelEnheter(
        matrikkel_enheter_list=[
            MatrikkelEnhet(id='1000000', owners=['00000000000', '10000000000']),
            MatrikkelEnhet(id='1000001', owners=['00000000001']),
            MatrikkelEnhet(id='1000002', owners=['00000000002']),
        ]
    )
    return_value = (
        '{"matrikkel_enheter_list": [{"id": "1000003", "owners": ["00000000002"]}]}'
    )
    mock_storage_client().bucket().blob().download_as_text.return_value = return_value

    services.update_matrikkel_data_in_storage(matrikkel_enheter, '1151', 1)

    mock_storage_client().bucket().blob().download_as_text.assert_called_once()

    mock_storage_client().bucket().blob().upload_from_string.assert_called_once_with(
        '{"matrikkel_enheter_list": [{"id": "1000003", "owners": ["00000000002"]}, {"id": "1000000", "owners": ["00000000000", "10000000000"]}, {"id": "1000001", "owners": ["00000000001"]}, {"id": "1000002", "owners": ["00000000002"]}]}'
    )


@mock.patch('services.storage.Client')
def test_update_matrikkel_data_in_storage_first_batch(mock_storage_client):
    # har en liste med enheter
    # sletter det som ligger der fra før
    # oppdaterer
    matrikkel_enheter = MatrikkelEnheter(
        matrikkel_enheter_list=[
            MatrikkelEnhet(id='1000000', owners=['00000000000', '10000000000']),
            MatrikkelEnhet(id='1000001', owners=['00000000001']),
            MatrikkelEnhet(id='1000002', owners=['00000000002']),
        ]
    )
    mock_storage_client().bucket().blob().exists.return_value = False

    services.update_matrikkel_data_in_storage(matrikkel_enheter, '1151', 0)

    mock_storage_client().bucket().blob().upload_from_string.assert_called_once_with(
        '{"matrikkel_enheter_list": [{"id": "1000000", "owners": ["00000000000", "10000000000"]}, {"id": "1000001", "owners": ["00000000001"]}, {"id": "1000002", "owners": ["00000000002"]}]}'
    )


@mock.patch('services.pubsub_v1.PublisherClient')
def test_publish_to_pubsub(mock_publisher_client):
    message = MatrikkelDownloadMessage(
        municipality_number='1234',
        batch_number=0,
        from_matrikkel_id=11111,
    )  # type: ignore
    services.publish_to_pubsub('topic-id', message.encode_for_pubsub())
    assert mock_publisher_client.return_value.publish.call_count == 1
