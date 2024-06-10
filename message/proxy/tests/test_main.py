import json

import responses
from main import send_request


def check_body(check_body):
    def t(body):
        for index, message in enumerate(json.loads(body)['messages']):
            if message['variables']['name'] != check_body[index]:
                return False
        return True

    return t


def test_send_request_all_pass(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Messages': [response_success, response_success, response_success]},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 200


def test_send_request_one_fail(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Messages': [response_success, response_success, response_error]},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
    )
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Messages': [response_error]},
        match=[check_body(['Test3'])],
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 200


def test_send_request_one_fail_then_pass(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Messages': [response_success, response_success, response_error]},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
    )
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Messages': [response_success]},
        match=[check_body(['Test3'])],
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 200


def test_send_request_error(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'Error': 'Some error'},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
        status=500,
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 500


def test_send_request_response_429(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'error': 'Stop it'},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
        status=429,
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 420


def test_send_request_response_429_with_retry_header(
    mocked_responses, request_body, response_success, response_error
):
    mocked_responses.add(
        responses.POST,
        url='https://api.eu.mailjet.com/v3.1/send',
        json={'error': 'Stop it'},
        headers={'Retry-After': '5'},
        match=[check_body(['Test1', 'Test2', 'Test3'])],
        status=429,
    )
    response = send_request(json.dumps(request_body), {}, '')
    assert response[1] == 429
