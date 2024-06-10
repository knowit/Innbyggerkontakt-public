import json
from unittest import mock

import main
from innbyggerkontakt.models.person_list import PersonList
from requests import Request
from tests.test_data import (
    content,
    freg_persons,
    identifiers,
    krr_persons,
    krr_persons_single,
    mailjet_body_nb,
    mailjet_body_nb_single,
    mailjet_body_nn,
    mailjet_list,
    mailjet_list_single,
    manual_list_email_and_name_persons,
    matrikkel_persons,
    nameless_mailjet_list,
    request_person_email,
    request_person_no_email,
    template_application,
)

from models.krr import KrrPerson
from models.request import RequestPerson


class MockRequest:
    def __init__(self, data):
        self._data = data

    @property
    def data(self):
        return self._data


def patch_decorator(*args, **kwargs):
    def decorator(func):
        def wrapper(self, *args, **kwargs):
            return func(self, *args, **kwargs)

        return wrapper

    return decorator


@mock.patch('main.utils')
@mock.patch('main.get_krr_persons')
@mock.patch('main.Mailjet')
def test_message_main_manual_list(mock_mailjet, mock_krr, mock_utils):
    request = MockRequest(
        json.dumps(
            {
                'index': 1,
                'total': 1,
                'data': {
                    'identifiers': identifiers.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'content': content.dict(exclude_none=True, exclude_unset=True),
                    'template_application': template_application.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'sandbox_mode': False,
                    'file_path': 'path/mml/test',
                },
            }
        )
    )
    mock_utils.CloudStorage.return_value.get_file_from_bucket.return_value = (
        manual_list_email_and_name_persons
    )

    main.message(request)


@mock.patch('main.utils')
@mock.patch('main.get_krr_persons')
@mock.patch('main.Mailjet')
def test_message_main_matrikkel_list(mock_mailjet, mock_krr, mock_utils):
    request = MockRequest(
        json.dumps(
            {
                'index': 1,
                'total': 1,
                'data': {
                    'identifiers': identifiers.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'content': content.dict(exclude_none=True, exclude_unset=True),
                    'template_application': template_application.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'sandbox_mode': False,
                    'file_path': 'path/matrikkel/test',
                },
            }
        )
    )
    mock_utils.CloudStorage.return_value.get_file_from_bucket.return_value = (
        matrikkel_persons
    )
    mock_krr.return_value = PersonList(
        persons=[KrrPerson.parse_obj(person) for person in krr_persons['personer']]
    )

    mock_mailjet.return_value.generate_request.return_value = [
        Request(
            'POST',
            url='https://test.no',
            headers={'test': 'test'},
            data=json.dumps(mailjet_body_nb),
        ).prepare(),
        Request(
            'POST',
            url='https://test.no',
            headers={'test': 'test'},
            data=json.dumps(mailjet_body_nn),
        ).prepare(),
    ]

    main.message(request)

    mock_krr.assert_called_once_with(
        ['01234567890', '01234567891', '01234567892', '01234567893'], 'nb', 'test'
    )
    kwargs = mock_mailjet.call_args[1]

    assert kwargs['mailing_list'] == nameless_mailjet_list
    assert kwargs['content'] == content
    assert kwargs['template_application'] == template_application
    assert kwargs['identifiers'] == identifiers

    mock_mailjet.return_value.generate_request.assert_called_once_with(
        sandbox_mode=False
    )


@mock.patch('main.utils')
@mock.patch('main.get_krr_persons')
@mock.patch('main.Mailjet')
def test_message_main_freg_list(mock_mailjet, mock_krr, mock_utils):
    request = MockRequest(
        json.dumps(
            {
                'index': 1,
                'total': 1,
                'data': {
                    'identifiers': identifiers.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'content': content.dict(exclude_none=True, exclude_unset=True),
                    'template_application': template_application.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'sandbox_mode': False,
                    'file_path': 'path/freg/test',
                },
            }
        )
    )

    mock_utils.CloudStorage.return_value.get_file_from_bucket.return_value = (
        freg_persons
    )
    mock_krr.return_value = PersonList(
        persons=[KrrPerson.parse_obj(person) for person in krr_persons['personer']]
    )

    mock_mailjet.return_value.generate_request.return_value = [
        Request(
            'POST',
            url='https://test.no',
            headers={'test': 'test'},
            data=json.dumps(mailjet_body_nb),
        ).prepare(),
        Request(
            'POST',
            url='https://test.no',
            headers={'test': 'test'},
            data=json.dumps(mailjet_body_nn),
        ).prepare(),
    ]

    main.message(request)

    mock_krr.assert_called_once_with(
        ['01234567890', '01234567891', '01234567892', '01234567893'], 'nb', 'test'
    )
    kwargs = mock_mailjet.call_args[1]

    assert kwargs['mailing_list'] == mailjet_list
    assert kwargs['content'] == content
    assert kwargs['template_application'] == template_application
    assert kwargs['identifiers'] == identifiers

    mock_mailjet.return_value.generate_request.assert_called_once_with(
        sandbox_mode=False
    )


@mock.patch('main.utils')
@mock.patch('main.get_krr_persons')
@mock.patch('main.Mailjet')
def test_message_main_single(mock_mailjet, mock_krr, mock_utils):
    request = MockRequest(
        json.dumps(
            {
                'index': 1,
                'total': 1,
                'data': {
                    'identifiers': identifiers.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'content': content.dict(exclude_none=True, exclude_unset=True),
                    'template_application': template_application.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'sandbox_mode': False,
                    'person': request_person_no_email,
                },
            }
        )
    )

    mock_krr.return_value = PersonList(
        persons=[
            KrrPerson.parse_obj(person) for person in krr_persons_single['personer']
        ]
    )

    mock_mailjet.return_value.generate_request.return_value = [
        Request(
            'POST',
            url='https://test.no',
            headers={'test': 'test'},
            data=json.dumps(mailjet_body_nb_single),
        ).prepare()
    ]

    main.message(request)

    mock_krr.assert_called_once_with(['01234567890'], 'nb', 'test')
    kwargs = mock_mailjet.call_args[1]

    assert kwargs['mailing_list'] == mailjet_list_single
    assert kwargs['content'] == content
    assert kwargs['template_application'] == template_application
    assert kwargs['identifiers'] == identifiers

    mock_mailjet.return_value.generate_request.assert_called_once_with(
        sandbox_mode=False
    )


@mock.patch('main.utils')
@mock.patch('main.get_krr_persons')
@mock.patch('main.send_single')
def test_message_test_mail(mock_mailjet, mock_krr, mock_utils):
    request = MockRequest(
        json.dumps(
            {
                'index': 1,
                'total': 1,
                'data': {
                    'identifiers': identifiers.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'content': content.dict(exclude_none=True, exclude_unset=True),
                    'template_application': template_application.dict(
                        exclude_none=True, exclude_unset=True
                    ),
                    'sandbox_mode': False,
                    'person': request_person_email,
                    'status': 'test',
                },
            }
        )
    )

    mock_mailjet.return_value = Request(
        'POST',
        url='https://test.no',
        headers={'test': 'test'},
        data=json.dumps({'test': 'test'}),
    ).prepare()

    main.message(request)
    mock_mailjet.assert_called_once_with(
        RequestPerson(**request_person_email),
        content,
        template_application,
        identifiers,
        custom_campaign=False,
    )
    mock_utils.CloudTasks.return_value.add_to_queue.assert_called_once_with(
        'https://test.no/',
        body='{"test": "test"}',
        headers={'test': 'test', 'Content-Length': '16'},
    )
    mock_krr.assert_not_called()
