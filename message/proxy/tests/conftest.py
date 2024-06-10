# pylint: disable=all
import json

import pytest
from responses import RequestsMock


@pytest.fixture(autouse=True)
def mock_cloud_task(mocker):
    yield mocker.patch('main.CloudTasks', autospec=True)


@pytest.fixture
def mocked_responses():
    with RequestsMock() as reqs:
        yield reqs


@pytest.fixture()
def request_body():
    with open('tests/data/request_body.json', 'r') as json_file:
        yield json.load(json_file)


@pytest.fixture()
def response_error():
    with open('tests/data/response_error.json', 'r') as json_file:
        yield json.load(json_file)


@pytest.fixture()
def response_success():
    with open('tests/data/response_success.json', 'r') as json_file:
        yield json.load(json_file)
