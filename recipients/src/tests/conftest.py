# pylint: disable=all
import json
from importlib import reload

import pytest
from _pytest.monkeypatch import MonkeyPatch
from configs import matrikkel_config
from responses import RequestsMock

import freg_config


@pytest.fixture
def mocked_responses():
    with RequestsMock() as reqs:
        yield reqs


@pytest.fixture()
def get_test_person():
    with open('src/tests/data/person.json', 'r', encoding='utf-8') as json_file:
        yield json.load(json_file)


@pytest.fixture()
def get_test_lookup():
    with open('src/tests/data/lookup.json', 'r', encoding='utf-8') as json_file:
        yield json.load(json_file)


@pytest.fixture(scope='session', autouse=True)
def mock_env_variables():
    monkeypatch = MonkeyPatch()
    monkeypatch.setenv('GCLOUD_REGION', 'test_gcloud_region')
    monkeypatch.setenv('RECIPIENTS_FEED_QUEUE', 'test_queue')
    monkeypatch.setenv('RECIPIENTS_STATUS_TOPIC', 'test_status_topic')
    monkeypatch.setenv('FREG_EVENT_TOPIC', 'test_event_topic')
    monkeypatch.setenv('OUTCOME_TOPIC', 'test_outcome_topic')
    monkeypatch.setenv('FIKS_ENDPOINT', 'https://test-fiks.no')
    monkeypatch.setenv('MASKINPORTEN_URL', 'https://test-maskinporten.no')
    monkeypatch.setenv('APP_ENGINE_REGION', 'test-region')
    monkeypatch.setenv('EVENT_ORGANIZATION', 'test-organization')
    monkeypatch.setenv('MATRIKKEL_ENDPOINT', 'https://prodtest.matrikkel.no')
    reload(matrikkel_config)
    reload(freg_config)
    yield monkeypatch
    monkeypatch.undo()


@pytest.fixture()
def get_event_feed():
    with open('src/tests/data/event_feed.json', 'r', encoding='utf-8') as json_file:
        yield json.load(json_file)
