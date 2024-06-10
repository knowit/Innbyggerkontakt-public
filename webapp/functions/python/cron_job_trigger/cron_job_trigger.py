# pylint: disable=R0911, R1705
"""Cron job triggers."""
import time
from datetime import timedelta

from firebase_admin import firestore


def delete_outdated_mml_filter():
    """Delete outdated mml filters in all bulletins that are in draft."""
    db = firestore.Client()

    bulletin_snapshots = db.collection_group('default').where('status', '==', 'draft')
    for bulletin_snapshot in bulletin_snapshots.stream():
        bulletin_dict = bulletin_snapshot.to_dict()
        if not _can_be_handled(bulletin_dict):
            continue
        mml_filters = bulletin_dict['recipients']['manual']
        timestamped_filters = filter(_is_timestamped, mml_filters)
        outdated_filters = list(filter(_filter_is_older_than, timestamped_filters))
        if not outdated_filters:
            continue
        fresh_mml_filters = [f for f in mml_filters if f not in outdated_filters]
        bulletin_snapshot.reference.update({'recipients.manual': fresh_mml_filters})
        filter_collection = bulletin_snapshot.reference.collection('manualRecipients')
        for o_filter in outdated_filters:
            f_id = o_filter['id']
            filter_collection.document(f_id).delete()
        print(f'Deleted {outdated_filters}')


def _is_timestamped(mml_filter: dict) -> bool:
    return 'createdTimestamp' in mml_filter


def _filter_is_older_than(mml_filter: dict, days: int = 30) -> bool:
    """Will return true if the old filters timestamp is older than `days=30`."""
    timestamp_x_days_ago_seconds = time.time() - timedelta(days=days).total_seconds()
    timestamp_x_days_ago_milli = timestamp_x_days_ago_seconds * 1000
    filter_timestamp = float(mml_filter['createdTimestamp'])
    return filter_timestamp < timestamp_x_days_ago_milli


def _can_be_handled(bulletin_dict: dict) -> bool:
    return (
        bulletin_dict
        and 'recipients' in bulletin_dict
        and 'manual' in bulletin_dict['recipients']
        and bulletin_dict['recipients']['manual']
    )
