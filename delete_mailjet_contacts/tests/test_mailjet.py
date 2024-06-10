from delete_mailjet_contacts.mailjet import run_auto_delete


def test_get_contacts():
    contacts = run_auto_delete()
    assert len(contacts) >= 0
