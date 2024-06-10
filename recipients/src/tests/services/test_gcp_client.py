import pytest

from models.freg_model import Lookup
from services.gcp_client import GcpClient


@pytest.fixture(autouse=True)
def mock_gcp(mocker):
    yield mocker.patch('services.gcp_client.gcp', autospec=True)


@pytest.fixture()
def client():
    yield GcpClient(organization_id='test-organization', bulletin_id='test-bulletin')


def test_upload_persons(client, mock_gcp, get_test_lookup):
    persons = Lookup(**get_test_lookup).lookup
    client.upload_persons(0, persons)
    mock_gcp.CloudStorage.return_value.upload_file_to_bucket.assert_called_once_with(
        'freg/test-organization/test-bulletin/0.json',
        [
            {'freg_identifier': '14079002012', 'name': 'Forståelsesfullblautoppblåst'},
            {'freg_identifier': '04019002697', 'name': 'Pen'},
            {'freg_identifier': '10029002369', 'name': 'Episk'},
            {'freg_identifier': '07049000582', 'name': 'Famøs'},
            {'freg_identifier': '35643678543', 'name': 'Famøs'},
            {'freg_identifier': '35643678547', 'name': 'Famøs'},
            {'freg_identifier': '35643678546', 'name': ''},
        ],
    )


def test_outcome(client, mock_gcp):
    client.outcome(10)

    mock_gcp.Publisher.return_value.publish_message.assert_called_once_with(
        data={'hits': 10},
        bulletin_id='test-bulletin',
        organization_id='test-organization',
        type='recipients',
    )


def test_upload_metadata(client, mock_gcp):
    metadata = {'hits': 10, 'date': '2021-03-04'}
    client.upload_metadata(metadata)

    mock_gcp.CloudStorage.return_value.upload_file_to_bucket.assert_called_once_with(
        'freg/test-organization/test-bulletin/metadata.json', metadata
    )


def test_publish_status(client, mock_gcp):
    client.publish_status(hits=10, bulletin_type='search')

    mock_gcp.Publisher.return_value.publish_message.assert_called_once_with(
        data={'hits': 10, 'path': 'freg/test-organization/test-bulletin'},
        bulletin_id='test-bulletin',
        organization_id='test-organization',
        bulletin_type='search',
    )
