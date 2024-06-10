from innbyggerkontakt.models.person_list import PersonList
from pandas import DataFrame

from models.freg import FregPerson
from models.mailjet import MailjetPerson
from models.request import Attributes, Content, RequestPerson, TemplateApplication


recipients = PersonList(
    persons=[
        FregPerson(freg_identifier='01234567890', name='Test0'),
        FregPerson(freg_identifier='01234567891', name='Test1'),
        FregPerson(freg_identifier='01234567892', name='Test2'),
        FregPerson(freg_identifier='01234567893', name='Test3'),
    ]
)


recipients_old = {
    '01234567890': FregPerson(freg_identifier='01234567890', name='Test0'),
    '01234567891': FregPerson(freg_identifier='01234567891', name='Test1'),
    '01234567892': FregPerson(freg_identifier='01234567892', name='Test2'),
    '01234567893': FregPerson(freg_identifier='01234567893', name='Test3'),
}

recipients_single = {
    '01234567890': RequestPerson(freg_identifier='01234567890', name='Test0')
}

mailjet_list_single = PersonList(
    persons=[
        MailjetPerson.parse_obj(
            {'email': 'test0@test.no', 'desired_language': 'nb', 'name': 'Test0'}
        )
    ]
)

mailjet_list = PersonList(
    persons=[
        MailjetPerson.parse_obj(
            {'email': 'test0@test.no', 'desired_language': 'nb', 'name': 'Test0'}
        ),
        MailjetPerson.parse_obj(
            {'desired_language': None, 'email': 'test1@test.no', 'name': 'Test1'}
        ),
        MailjetPerson.parse_obj(
            {'desired_language': 'nn', 'email': 'test2@test.no', 'name': 'Test2'}
        ),
    ]
)

nameless_mailjet_list = PersonList(
    persons=[
        MailjetPerson.parse_obj(
            {
                'email': 'test0@test.no',
                'desired_language': 'nb',
            }
        ),
        MailjetPerson.parse_obj(
            {
                'desired_language': None,
                'email': 'test1@test.no',
            }
        ),
        MailjetPerson.parse_obj(
            {
                'desired_language': 'nn',
                'email': 'test2@test.no',
            }
        ),
    ]
)

contact_info_old = DataFrame.from_dict(
    {
        '01234567890': {
            'personidentifikator': '01234567890',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {
                'epostadresse': 'test0@test.no',
                'epostadresse_oppdatert': None,
                'epostadresse_sist_verifisert': None,
            },
            'spraak': 'nb',
            'spraak_oppdatert': None,
        },
        '01234567891': {
            'personidentifikator': '01234567891',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {
                'epostadresse': 'test1@test.no',
                'epostadresse_oppdatert': None,
                'epostadresse_sist_verifisert': None,
            },
            # 'spraak': '',
            'spraak_oppdatert': None,
        },
        '01234567892': {
            'personidentifikator': '01234567892',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {
                'epostadresse': 'test2@test.no',
                'epostadresse_oppdatert': None,
                'epostadresse_sist_verifisert': None,
            },
            'spraak': 'nn',
            'spraak_oppdatert': None,
        },
        '01234567893': {
            'personidentifikator': '01234567893',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {
                'epostadresse': 'test3@test.no',
                'epostadresse_oppdatert': None,
                'epostadresse_sist_verifisert': None,
            },
            'spraak': 'en',
            'spraak_oppdatert': None,
        },
    },
    orient='index',
)

contact_info_single = DataFrame.from_dict(
    {
        '01234567890': {
            'personidentifikator': '01234567890',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {
                'epostadresse': 'test0@test.no',
                'epostadresse_oppdatert': None,
                'epostadresse_sist_verifisert': None,
            },
            'spraak': 'nb',
            'spraak_oppdatert': None,
        }
    },
    orient='index',
)

content = Content(
    **{
        'from_': {'email': 'test@test.no', 'name': 'Test Testersen'},
        'default_language': 'nb',
        'language': {
            'nb': {
                'subject': 'Test',
                'variables': {'var0': 'var0', 'var1': 'var1', 'var2': 'var2'},
            },
            'nn': {
                'subject': 'Test',
                'variables': {'var0': 'var0', 'var1': 'var1', 'var2': 'var2'},
            },
        },
    }
)

template_application = TemplateApplication(
    **{
        'global_variables': ['var0', 'var1', 'var2'],
        'local_variables': ['name'],
        'mailjet_template': 0,
    }
)

identifiers = Attributes(
    organization_id='test',
    bulletin_id='test',
    trace_string='34958734ef9dvfkgvdfs',
    bulletin_type='search',
)

manual_list_email_and_name_persons_json_string = '''[
    {"name": "Anette Test Antonsen",
     "email": "a@a.com"
     },
    {
        "name": "Bengt Test Bengtson",
        "email": "b@b.com"
    },
    {
        "name": "Charlie Test Chess",
        "email": "c@c.com"
    }
]'''

manual_list_email_and_name_persons = [
    {'name': 'Anette Test Antonsen', 'email': 'a@a.com'},
    {'name': 'Bengt Test Bengtson', 'email': 'b@b.com'},
    {'name': 'Charlie Test Chess', 'email': 'c@c.com'},
]

krr_persons = {
    'personer': [
        {
            'personidentifikator': '01234567890',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {'epostadresse': 'test0@test.no'},
            'spraak': 'nb',
        },
        {
            'personidentifikator': '01234567891',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {'epostadresse': 'test1@test.no'},
            'spraak': None,
        },
        {
            'personidentifikator': '01234567892',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {'epostadresse': 'test2@test.no'},
            'spraak': 'nn',
        },
        {
            'personidentifikator': '01234567893',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {'epostadresse': None},
            'spraak': 'en',
        },
    ]
}

krr_persons_single = {
    'personer': [
        {
            'personidentifikator': '01234567890',
            'reservasjon': 'NEI',
            'status': 'AKTIV',
            'kontaktinformasjon': {'epostadresse': 'test0@test.no'},
            'spraak': 'nb',
        }
    ]
}

freg_persons = [
    {'freg_identifier': '01234567890', 'name': 'Test0'},
    {'freg_identifier': '01234567891', 'name': 'Test1'},
    {'freg_identifier': '01234567892', 'name': 'Test2'},
    {'freg_identifier': '01234567893', 'name': 'Test3'},
]

matrikkel_persons = [
    {
        'freg_identifier': '01234567890',
    },
    {
        'freg_identifier': '01234567891',
    },
    {
        'freg_identifier': '01234567892',
    },
    {
        'freg_identifier': '01234567893',
    },
]

mailjet_body_nb = {
    'globals': {
        'from': {'email': 'test@test.no', 'name': 'Test Testersen'},
        'subject': 'Test',
        'variables': {'var0': 'var0', 'var1': 'var1', 'var2': 'var2'},
        'TemplateID': 0,
        'TemplateLanguage': True,
        'CustomCampaign': 'test',
        'DeduplicateCampaign': True,
    },
    'messages': [
        {
            'to': [{'email': 'test0@test.no', 'name': 'Test0'}],
            'variables': {'name': 'Test0'},
        },
        {
            'to': [{'email': 'test1@test.no', 'name': 'Test1'}],
            'variables': {'name': 'Test1'},
        },
    ],
    'SandboxMode': False,
}

mailjet_body_nb_single = {
    'globals': {
        'from': {'email': 'test@test.no', 'name': 'Test Testersen'},
        'subject': 'Test',
        'variables': {'var0': 'var0', 'var1': 'var1', 'var2': 'var2'},
        'TemplateID': 0,
        'TemplateLanguage': True,
        'CustomCampaign': 'test',
        'DeduplicateCampaign': True,
    },
    'messages': [
        {
            'to': [{'email': 'test0@test.no', 'name': 'Test0'}],
            'variables': {'name': 'Test0'},
        }
    ],
    'SandboxMode': False,
}

mailjet_body_nn = {
    'globals': {
        'from': {'email': 'test@test.no', 'name': 'Test Testersen'},
        'subject': 'Test',
        'variables': {'var0': 'var0', 'var1': 'var1', 'var2': 'var2'},
        'TemplateID': 0,
        'TemplateLanguage': True,
        'CustomCampaign': 'test',
        'DeduplicateCampaign': True,
    },
    'messages': [
        {
            'to': [{'email': 'test2@test.no', 'name': 'Test2'}],
            'variables': {'name': 'Test2'},
        }
    ],
    'SandboxMode': False,
}

request_person_no_email = {
    'freg_identifier': '01234567890',
    'name': 'Test0',
}

request_person_email = {
    'freg_identifier': '01234567890',
    'name': 'Test0',
    'email': 'test@test.no',
}
