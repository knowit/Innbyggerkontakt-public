import json
from unittest.mock import MagicMock, patch

import cron_job_trigger
from freezegun import freeze_time

# from mockfirestore import MockFirestore
from pytest import mark


@patch('cron_job_trigger.cron_job_trigger.firestore.Client', autospec=True)
@mark.parametrize(
    'org_id,bulletin_id,expected_change,delete_all',
    [
        ('org1', 'bull1', True, False),
        ('org1', 'bull2', False, False),
        ('org2', 'bull1', True, True),
        ('org2', 'bull2', False, False),
        ('org2', 'bull3', False, False),
    ],
)
@freeze_time('2022-03-04')
def test_delete_outdated_mml_filter(
    firebase_mock, org_id, bulletin_id, expected_change, delete_all
):

    filter_path = f'tests/cron_job_trigger_bulletins/test_cron_job_{org_id}_{bulletin_id}_mml.json'

    if delete_all:
        expected_updated = []
    elif expected_change:
        expected_path = f'tests/cron_job_trigger_bulletins/test_cron_job_{org_id}_{bulletin_id}_mml_expected.json'
        with open(expected_path, 'r') as input_file:
            expected_updated = json.loads(input_file.read())

    with open(filter_path, 'r') as input_file:
        mml_filter = json.loads(input_file.read())

    mock_snapshot = MagicMock()
    mock_snapshot.to_dict.return_value = mml_filter
    firebase_mock.return_value.collection_group('default').where(
        'status', '==', 'draft'
    ).stream.return_value = [mock_snapshot]
    cron_job_trigger.cron_job_trigger.delete_outdated_mml_filter()

    if expected_change:
        mock_snapshot.reference.update.assert_called_with(
            {'recipients.manual': expected_updated}
        )
    else:
        mock_snapshot.reference.update.assert_not_called()
