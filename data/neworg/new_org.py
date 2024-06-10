"""CLI to guide users."""
import json
from collections import namedtuple
from functools import cache
from typing import Optional

import google.auth
import requests
from cleo.application import Application
from cleo.commands.command import Command
from cleo.helpers import argument, option
from clikit.ui.components import Question
from google.cloud import secretmanager
from jinja2 import Environment, PackageLoader, select_autoescape
from neworg import firestore
from pygments import highlight
from pygments.formatters import TerminalFormatter
from pygments.lexers import JsonLexer
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError


env = Environment(
    autoescape=select_autoescape(),
    loader=PackageLoader('neworg'),
)

MAILJET_URL = 'https://api.mailjet.com/v3/REST'

globalargs = [
    argument(
        'orgid',
        description='Which orgid do you want to operate on?',
        optional=False,
    )
]


def access_secret(secret_id):
    """Access the payload for the given secret version if one exists."""
    client = secretmanager.SecretManagerServiceClient()
    _, project_id = google.auth.default()
    name = f'projects/{project_id}/secrets/{secret_id}/versions/latest'
    response = client.access_secret_version(request={'name': name})
    return response.payload.data.decode('UTF-8')


def create_secret(secret_id, payload):
    """
    Create a new secret with the given name.

    A secret is a logical wrapper
    around a collection of secret versions. Secret versions hold the actual
    secret material.
    """
    client = secretmanager.SecretManagerServiceClient()
    _, project_id = google.auth.default()
    parent = f'projects/{project_id}'
    client.create_secret(
        request={
            'parent': parent,
            'secret_id': secret_id,
            'secret': {'replication': {'automatic': {}}},
        }
    )
    payload = payload.encode('UTF-8')
    parent = client.secret_path(project_id, secret_id)

    client.add_secret_version(
        request={
            'parent': parent,
            'payload': {'data': payload},
        }
    )


def municipality_validator(municipality_number: str) -> str:
    """Validate the municipality."""
    assert 0 < int(municipality_number) <= 9999, 'Number must be between 0 and 9999'
    return municipality_number


def populate_template(file, **kwargs):
    """Use Jinja to get json dump."""
    template = env.get_template(file)
    return template.render(**kwargs)


def shortcode_validator(short_code):
    """Needs to be ascii and below 11 chars."""
    assert (
        0 < len(short_code.encode('ascii')) <= 11
    ), 'Short must be less than 11 chars.'
    return short_code


@cache
def get_mailjet_auth(orgid) -> HTTPBasicAuth:
    """Fetch api key and secret and return a HTTPBasicAuth."""
    api_key = access_secret(f'{orgid}_mailjet_key')
    api_secret = access_secret(f'{orgid}_mailjet_secret')
    return HTTPBasicAuth(api_key, api_secret)


def get_file(path):
    """Return the file content in path."""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


class ShowDefaultQuestion(Question):
    """Same as Question, but shows default."""

    def _write_prompt(self, io):
        """Outputs the question prompt."""
        message = self._question
        default = self._default

        if default:
            message = f'<question>{message}</> [<comment>{default}</>]:'
        else:
            message = f'<question>{message}</>:'
        io.error(message)


class UploadOrgToFSCommand(Command):
    """Upload an org to Firestore."""

    name = 'initorg'
    arguments = globalargs

    options = [
        option(
            'kommunenummer',
            'k',
            description='What "Kommunenummer" the kommune has',
            flag=False,
        ),
        option('annet', 'a', description='Not a kommune type but "annet"', flag=True),
        option('email', 'e', description='Default email.', flag=False),
        option('interactive', 'i', description='Run in Interactive mode.', flag=True),
        option('sms', 's', description='SMS shortcode.', flag=False),
        option('navn', 'w', description='Navn', flag=False),
        option('yes', 'y', description='Skip confirmations.', flag=True),
    ]

    def get_org_type(self):
        """Could be kommune or annet."""
        kommunenummer = self.option('kommunenummer')
        is_kommune = not self.option('annet')
        orgid = self.argument('orgid')
        self.line(f'Creating {orgid} in firestore.')
        if not is_kommune and kommunenummer:
            raise AssertionError('Can not have kommunenummer with "annet".')
        elif is_kommune and not kommunenummer:  # Either kommune or not, have to ask.
            is_kommune = self.confirm(f'Is {orgid} a kommune?', default=True)
        if is_kommune and not kommunenummer:
            _q = Question('Municipality number?')
            _q.set_validator(municipality_validator)
            municipality_number = self.ask(_q)
            return 'kommune', municipality_number

        if not is_kommune:
            return (
                self.ask(ShowDefaultQuestion('What org type?', default='annet')),
                None,
            )

    def get_navn(self):
        """Get navn."""
        if self.option('navn'):
            navn = self.option('navn')
        else:
            navn = self.ask('navn?')
        return navn

    def get_email(self):
        """Get email."""
        if self.option('email'):
            default_email = self.option('email')
        else:
            default_email = self.ask('default email?')
        return default_email

    def handle(self):
        """Handle the command."""
        interactive = self.option('interactive')
        orgid = self.argument('orgid')
        navn = self.get_navn()
        default_email = self.get_email()

        org_type, municipality_number = self.get_org_type()

        if interactive and self.confirm('Enable SMS?', default=True):
            _q = ShowDefaultQuestion('Short code?', default=orgid[:11])
            _q.set_validator(shortcode_validator)
            short_code = self.ask(_q)
        else:
            short_code = self.option('sms')
        jinja_json = populate_template(
            'org.json.jinja',
            municipality_number=municipality_number,
            has_sms=bool(short_code),
            navn=navn,
            org_type=org_type,
            default_email=default_email,
            short_code=short_code,
        )
        self.line('Collected following info:')
        print(highlight(jinja_json, JsonLexer(), TerminalFormatter()))
        if self.confirm('Confirm adding org to FS?', default=True):
            firestore.add_document_with_id(
                collection='organization',
                document=orgid,
                data=json.loads(jinja_json),
            )


class CreateSubAccount(Command):
    """Create a API keys and upload them to gcp secrets."""

    name = 'createsub'
    arguments = globalargs

    def handle(self) -> Optional[int]:
        """Handle the command."""
        orgid = self.argument('orgid')
        try:
            user = access_secret('master_mailjet_key')
            passw = access_secret('master_mailjet_secret')
            auth = HTTPBasicAuth(user, passw)
            url = f'{MAILJET_URL}/apikey'
            data = {'Name': orgid}
            with self.spin('Creating subaccount', 'finnished'):
                resp = requests.post(
                    url=url, data=data, json={'Name': orgid}, auth=auth
                )
            resp.raise_for_status()
            api_key = resp.json()['Data'][0]['APIKey']
            secret_key = resp.json()['Data'][0]['SecretKey']
            self.line(f'APIKey: <info>{api_key}</info>')
            self.line(f'SecretKey: <info>{secret_key}</info>')
        except HTTPError as http_error:
            self.line(http_error, style='error')
        if api_key and secret_key and self.confirm('Add keys to secretmanager?'):
            create_secret(f'{orgid}_mailjet_key', api_key)
            create_secret(f'{orgid}_mailjet_secret', secret_key)


class UploadMJMLToMailjet(Command):
    """Upload MJML as a template to mailjet."""

    name = 'postmjml'
    arguments = globalargs
    options = [
        option(
            'path',
            'p',
            default='neworg/mjml_template/default.mjml',
            description='Path to .mjml file',
            flag=False,
        ),
        option(
            'tname', 't', description='Template name', default='default', flag=False
        ),
    ]

    def handle(self) -> Optional[int]:
        """Handle the command."""
        orgid = self.argument('orgid')
        template_name = self.option('tname')
        try:
            data = {
                'Author': 'Innbyggerkontakt',
                'Copyright': 'Innbyggerkontakt',
                'Description': 'Default template',
                'EditMode': 4,
                'IsStarred': True,
                'Locale': 'en_US',
                'Name': template_name,
                'OwnerType': 'apikey',
                'Presets': "{'h1':{'fontFamily':'Arial Black', Helvetica, Arial, sans-serif'}}",
                'Purposes': ['transactional'],
            }
            mailjet_auth = get_mailjet_auth(orgid=orgid)
            resp = requests.post(
                f'{MAILJET_URL}/template', auth=mailjet_auth, json=data
            )
            resp.raise_for_status()
            template_id = resp.json()['Data'][0]['ID']

            org_ref = firestore.db.collection('organization').document(orgid).get()
            if org_ref:
                org_ref_dict = org_ref.to_dict()
                sender_email = org_ref_dict['defaultEmailAddress']
                sender_name = org_ref_dict['navn']

            mjml_content = get_file(self.option('path'))
            data = {
                'Headers': {
                    'Subject': 'Epost',
                    'From': f'{sender_name} <{sender_email}>',
                },
                'MJMLContent': mjml_content,
                'Html-part': '',
            }
            resp = requests.post(
                f'{MAILJET_URL}/template/{template_id}/detailcontent',
                json=data,
                auth=mailjet_auth,
                headers={'Content-Type': 'application/json'},
            )
            resp.raise_for_status()
            self.line(
                f'Template <b>{template_name}</b> with id <b>{template_id}</b> created!',
                style='info',
            )
            return template_id
        except HTTPError as http_error:
            self.line(http_error, style='error')


class UploadTemplateID(Command):
    """Upload a document under the orgid/template_application."""

    name = 'posttemplate'
    arguments = globalargs + [argument('templateid', description='Template id.')]
    options = [
        option(
            'doc-name',
            description='The document name',
            default='default',
            flag=False,
        ),
        option(
            'template-template',
            't',
            description='template for the template, where the variables are',
            default='common-templates/ta_enkelsak.json',
            flag=False,
        ),
        option(
            'deactivated',
            'd',
            description='Use flag to set active=False in the template.',
            flag=True,
        ),
        option(
            'update',
            'u',
            description='Only upload the templateid, not ta_enkeltsak',
            flag=True,
        ),
    ]

    def upload_ta_enkeltsak(self):
        """Handle the command."""
        firestore.organization = firestore.set_parent_collection()
        data = json.loads(get_file(self.option('template-template')))
        firestore.add_document_with_id(
            collection='template_application', document='ta_enkeltsak', data=data
        )

    def handle(self):
        """Handle the command."""
        orgid = self.argument('orgid')
        if not self.option('update'):
            MockArg = namedtuple('MockArg', ['org'])
            firestore.args = MockArg(org=orgid)
            self.upload_ta_enkeltsak()
        data = {
            'active': not self.option('deactivated'),
            'id': int(self.argument('templateid')),
        }

        firestore.db.collection('organization').document(orgid).collection(
            'template_application'
        ).document('ta_enkeltsak').collection('mailjet_template_ids').document(
            'default'
        ).set(
            data
        )

        self.line(
            f'Template with data <b>{data}</b> uploaded!',
            style='info',
        )


class InteractiveCommand(Command):
    """Guide the user to creating a new org."""

    name = 'interactive'
    arguments = globalargs
    options = UploadOrgToFSCommand.options

    def handle(self):
        """Handle the arguments."""
        orgid = self.argument('orgid')

        if self.confirm(f'Create {orgid} in fs?'):
            self.call('initorg', f'--interactive {orgid}')

        if self.confirm(f'Create subaccount {orgid} in mailjet?'):
            self.call('createsub', orgid)
        template_id = False
        if self.confirm('Add default template to mailjet?'):
            template_id = self.call('postmjml', orgid)
        if template_id and self.confirm(f'Add template {template_id}'):
            self.call('posttemplate', f'{orgid} {template_id}')


application = Application()
application.add(InteractiveCommand())
application.add(CreateSubAccount())
application.add(UploadOrgToFSCommand())
application.add(UploadMJMLToMailjet())
application.add(UploadTemplateID())
if __name__ == '__main__':
    application.run()
