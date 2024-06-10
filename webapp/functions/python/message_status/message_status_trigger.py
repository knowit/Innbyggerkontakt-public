# pylint: disable=W0613
"""Message status trigger."""
from firebase import db


def message_status_trigger(event, context):
    """
    Triggered by pubsub.

    event: dict = {
        attributes: {
            bulletin_id: str,
            organization_id: str,
            status: str,
        },
        data: "base64"
    }
    """
    status = event['attributes']['status']
    organization_id = event['attributes']['organization_id']
    bulletin_id = event['attributes']['bulletin_id']
    if status == 'done':
        bulletin_ref = (
            db.collection('organization')
            .document(organization_id)
            .collection('bulletin')
            .document('active')
            .collection('search')
            .document(bulletin_id)
        )

        bulletin = bulletin_ref.get().to_dict()
        bulletin['status'] = 'finished'
        db.collection('organization').document(organization_id).collection(
            'bulletin'
        ).document('finished').collection('default').document(bulletin_id).set(bulletin)

        bulletin_ref.delete()

    return 'OK', 200
