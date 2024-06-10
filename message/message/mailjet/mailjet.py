"""Generate mailjet api requests."""
import json
from typing import DefaultDict

import requests
from innbyggerkontakt.common.utils import divide_list
from innbyggerkontakt.gcp import utils
from innbyggerkontakt.models.person_list import PersonList
from mailjet_rest import Client

from models.mailjet import FromTo, Globals, MailjetApiRequest, Message
from models.request import (
    Attributes,
    Content,
    Identifiers,
    RequestPerson,
    TemplateApplication,
)


MAX_BATCH_SIZE = 50


class Mailjet:
    """Generate mailjet api requests."""

    # pylint: disable=too-many-instance-attributes
    # Eight is reasonable in this case.

    def __init__(
        self,
        mailing_list: PersonList,
        content: Content,
        template_application: TemplateApplication,
        identifiers: Attributes,
    ):
        self.template_application = template_application
        self.content = content
        self.mailing_list = mailing_list
        self.supported_languages = list(self.content.language.keys())

        api_key = utils.get_secret(f'{identifiers.organization_id}_mailjet_key')
        api_secret = utils.get_secret(f'{identifiers.organization_id}_mailjet_secret')
        self.mailjet = Client(auth=(api_key, api_secret), version='v3.1')
        self.identifiers = identifiers
        self._deduplicate_campaign: bool = identifiers.bulletin_type != 'event'

    @staticmethod
    def get_message_list(batch, local_values):
        """Create messages. Return List of messages."""
        message_list = []
        for person in batch:
            if person.email:
                recipient_info = FromTo(email=person.email, name=person.name)
                message_to_recipient = Message(
                    to=[recipient_info],
                    variables={value: getattr(person, value) for value in local_values},
                )
                message_list.append(message_to_recipient)
        return message_list

    def generate_request(self, sandbox_mode=False):
        # pylint: disable=W0212
        """Generate mailjet requests. Return List of prepared requests."""
        prepped_requests = []

        language_divided_persons = self._divide_persons_after_language()

        for language, persons in language_divided_persons.items():
            for person_batch in divide_list(persons, MAX_BATCH_SIZE):
                local_values = self.template_application.local_variables
                message_globals = Globals(
                    **{'from': self.content.from_},
                    subject=self.content.language[language].subject,
                    variables=self.content.language[language].variables,
                    TemplateID=self.template_application.mailjet_template,
                    CustomCampaign=self.identifiers.bulletin_id,
                    DeduplicateCampaign=self._deduplicate_campaign,
                )

                message_list = self.get_message_list(person_batch, local_values)

                message_data = MailjetApiRequest(
                    globals=message_globals,
                    messages=message_list,
                    SandboxMode=sandbox_mode,
                )

                mailjet_request = self.mailjet.send

                req = requests.Request(
                    'POST',
                    url=mailjet_request._url,
                    data=json.dumps(
                        message_data.dict(by_alias=True, exclude_none=True)
                    ),
                    params=None,
                    headers=mailjet_request.headers,
                    auth=mailjet_request._auth,
                )
                prepped = req.prepare()

                # Patches an issue with gcp overwriting our Authorization header
                if 'Authorization' in prepped.headers:
                    prepped.headers['X-Mailjet-Authorization'] = prepped.headers[
                        'Authorization'
                    ]

                prepped_requests.append(prepped)
        return prepped_requests

    def _divide_persons_after_language(self):
        person_desired_languages = {
            person.desired_language for person in self.mailing_list.persons
        }
        person_desired_languages.discard(None)
        language_divided_persons = DefaultDict(list)

        for language in sorted(person_desired_languages) + [None]:
            if language in self.supported_languages:
                language_divided_persons[language].extend(
                    [
                        person
                        for person in self.mailing_list.persons
                        if person.desired_language == language
                    ]
                )
            else:
                language_divided_persons[self.content.default_language].extend(
                    [
                        person
                        for person in self.mailing_list.persons
                        if person.desired_language == language
                    ]
                )

        return language_divided_persons


def send_single(
    request_person: RequestPerson,
    content: Content,
    template_application: TemplateApplication,
    identifiers: Identifiers,
    custom_campaign: bool = False,
):
    # pylint: disable=W0212
    """Generate a single mailjet request. Return a prepped request."""
    api_key = utils.get_secret(f'{identifiers.organization_id}_mailjet_key')
    api_secret = utils.get_secret(f'{identifiers.organization_id}_mailjet_secret')
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')
    message_globals = Globals(
        **{'from': content.from_},
        subject=content.language[content.default_language].subject,
        variables=content.language[content.default_language].variables,
        TemplateID=template_application.mailjet_template,
    )
    if custom_campaign:
        message_globals.custom_campaign = identifiers.bulletin_id
    recipient_info = FromTo(email=request_person.email, name=request_person.name)
    message_to_recipient = Message(
        to=[recipient_info],
        variables={
            value: getattr(request_person, value)
            for value in template_application.local_variables
        },
    )
    message_data = MailjetApiRequest(
        globals=message_globals, messages=[message_to_recipient]
    )
    mailjet_request = mailjet.send

    req = requests.Request(
        'POST',
        url=mailjet_request._url,
        data=json.dumps(message_data.dict(by_alias=True, exclude_none=True)),
        params=None,
        headers=mailjet_request.headers,
        auth=mailjet_request._auth,
    )

    prepped = req.prepare()

    # Patches an issue with gcp overwriting our Authorization header
    if 'Authorization' in prepped.headers:
        prepped.headers['X-Mailjet-Authorization'] = prepped.headers['Authorization']
    return prepped
