from unittest.mock import patch
from models.query_model import BulletinType
from routers.mml_router import mml_upload, _publish_status


class MockResponse:
    @staticmethod
    def upload_file_to_bucket(path, data):
        print(f'{path}, {data}')
        return None


class SnapShotMock:
    exists = True


class DockRefMock:
    def get(self):
        return SnapShotMock()

    def exists(self):
        return True


class DbMock:
    def document(self, docname):
        return 'data'


@patch('routers.mml_router.MMLService')
@patch('routers.mml_router.upload_persons_and_metadata_to_cloud_storage')
# @patch('services.mml.mml_service.db')
def test_mml_upload(_upload_mock, mml_service_class_mock):  # , db_mock):
    mml_service_mock = mml_service_class_mock.return_value
    mml_service_mock.get_filter_from_fs.return_value = [
        {'email': 'ola.nordmann@mail.no', 'name': 'Ola Nordmann '},
        {'email': 'kari.nordmann@mail.no', 'name': 'Kari Normann'},
    ]
    mml_service_mock.upload_persons_and_metadata_to_cloud_storage.return_value = None
    filter_id_dummy = 'filter_id_dummy'
    metadata = mml_upload(
        'bulletin_test',
        filter_id=filter_id_dummy,
        organization_id='orgt',
        bulletin_type=BulletinType.SEARCH,
    )
    assert metadata is not None
    mml_service_mock.update_filter_metadata_path.assert_called_once_with(
        filter_id=filter_id_dummy, path='mml/orgt/bulletin_test/filter_id_dummy/'
    )


def test_publish_status():
    _publish_status('test_bulletin_id', 'orgid', hits=42)
