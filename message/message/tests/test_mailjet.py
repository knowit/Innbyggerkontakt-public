import json
from unittest import mock

from mailjet.mailjet import Mailjet, send_single
from models.request import RequestPerson
from models.krr import KrrPerson
from models.freg import FregPerson
from models.mailjet import MailjetPerson
from tests.test_data import mailjet_list, freg_persons, krr_persons, content, template_application, identifiers, \
    mailjet_body_nb, mailjet_body_nn


def test_mailjetperson_from_krr_and_freg():
    mailjet_person = mailjet_list.persons[0]
    freg_person = FregPerson.parse_obj(freg_persons[0])
    krr_person = krr_persons['personer'][0]
    krr_person['default_language'] = 'nb'
    krr_person = KrrPerson.parse_obj(krr_person)
    assert mailjet_person == MailjetPerson.from_krr_and_freg(krr_person, freg_person)


@mock.patch('mailjet.mailjet.utils')
def test_mailjet_generate_request(mock_utils):
    mock_utils.get_secret.return_value = 'test'

    mailjet = Mailjet(mailjet_list, content, template_application, identifiers)

    request = mailjet.generate_request()
    assert len(request) == 2
    for r in request:
        assert r.headers.get('Authorization') == 'Basic dGVzdDp0ZXN0'
        assert r.headers.get('X-Mailjet-Authorization') == 'Basic dGVzdDp0ZXN0'
        assert json.loads(r.body) in [mailjet_body_nn, mailjet_body_nb]


@mock.patch('mailjet.mailjet.utils')
def test_send_single(mock_utils):
    mock_utils.get_secret.return_value = 'test'
    request_person = RequestPerson(freg_identifier='01234567890', name='Test0', email='test@test.no')
    request = send_single(request_person, content, template_application, identifiers, False)
    assert request.headers.get('Authorization') == 'Basic dGVzdDp0ZXN0'
    assert request.headers.get('X-Mailjet-Authorization') == 'Basic dGVzdDp0ZXN0'
    assert json.loads(request.body) == {
        'globals': {
            'from': {
                'email': 'test@test.no',
                'name': 'Test Testersen'
            },
            'subject': 'Test',
            'variables': {
                'var0': 'var0',
                'var1': 'var1',
                'var2': 'var2'
            },
            'TemplateID': 0,
            'TemplateLanguage': True,
            'DeduplicateCampaign': True
        },
        'messages': [
            {
                'to': [
                    {
                        'email': 'test@test.no',
                        'name': 'Test0'
                    }
                ],
                'variables': {
                    'name': 'Test0'
                }
            }
        ],
        'SandboxMode': False
    }

    request2 = send_single(request_person, content, template_application, identifiers, True)
    assert request2.headers.get('Authorization') == 'Basic dGVzdDp0ZXN0'
    assert request2.headers.get('X-Mailjet-Authorization') == 'Basic dGVzdDp0ZXN0'
    assert json.loads(request2.body) == {
        'globals': {
            'from': {
                'email': 'test@test.no',
                'name': 'Test Testersen'
            },
            'subject': 'Test',
            'variables': {
                'var0': 'var0',
                'var1': 'var1',
                'var2': 'var2'
            },
            'CustomCampaign': 'test',
            'TemplateID': 0,
            'TemplateLanguage': True,
            'DeduplicateCampaign': True
        },
        'messages': [
            {
                'to': [
                    {
                        'email': 'test@test.no',
                        'name': 'Test0'
                    }
                ],
                'variables': {
                    'name': 'Test0'
                }
            }
        ],
        'SandboxMode': False
    }
