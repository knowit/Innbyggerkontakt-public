from ps_message.sms_event import SMSEvent


def test_create_instance():
    se = SMSEvent(
        organizationId='asdf',
        bulletinId='asdf',
        jobbId='asdf',
        batch_number=1,
        kNumber='asdf',
    )
    assert se is not None
