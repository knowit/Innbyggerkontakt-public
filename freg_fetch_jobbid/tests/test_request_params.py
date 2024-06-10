import base64
import json

import pytest
from cloudevents.http import CloudEvent
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.request import (
    PersonstatustyperEnum,
    TilpassetUttrekkJobbRequest,
)
from pytest_mock.plugin import MockerFixture

from freg_fetch_jobbid.main import start_uttrekk_jobb


@pytest.fixture
def tujr_filter():
    return TilpassetUttrekkJobbRequest(
        foedselsaarFraOgMed='2000',
        foedselsaarTilOgMed='2002',
        doedsaarTilOgMed='2001',
        personstatustyper=[PersonstatustyperEnum.aktiv],
    )


@pytest.fixture
def simple_filter_born_after_2000():
    return {
        'freg_filter': {
            'foedselsaarFraOgMed': '2000',
            'foedselsaarTilOgMed': '2003',
            'personstatustyper': ['aktiv'],
            'kommunenummer': {'bostedskommunenummer': '9999'},
        },
        'organization_id': 'development',
        'sms_content': 'Hei på deg',
        'smsLang': 'nb',
        'bulletin_id': 'bulletin_from_local_test',
    }


@pytest.fixture
def cloud_event(simple_filter_born_after_2000):
    attributes = {
        'type': 'com.example.sampletype1',
        'source': 'https://example.com/event-producer',
    }
    b64_data = base64.b64encode(
        json.dumps(simple_filter_born_after_2000).encode(encoding='utf-8')
    )
    data = {'message': {'data': b64_data}, 'subscription': 'dummysub'}
    return CloudEvent(attributes, data=data)


def test_cloud_event_model(mocker: MockerFixture, cloud_event):
    mocker.patch('freg_fetch_jobbid.main.digdir.Auth')
    mocker.patch('freg_fetch_jobbid.main.create_fetch_uttrekk_message')
    mocker.patch('innbyggerkontakt.gcp.get_secret')
    post_mock = mocker.patch('requests.post')
    post_mock_instance = post_mock.return_value
    post_mock_instance.json.return_value = {'jobbId': 'a mocked jobbid'}
    # ost_mock.return_value = 'derp'
    start_uttrekk_jobb(cloud_event)
    assert post_mock.called


def test_url_uttrekk():
    from freg_fetch_jobbid.main import _uttrekk_url

    assert (
        _uttrekk_url(rolle='min_rolle')
        == 'https://api.fiks.test.ks.no/folkeregister/api/v1/min_rolle/v1/uttrekk/tilpasset'
    )


@pytest.mark.integration_test  # `pytest --run-integration` To include. Skipped in CI
def test_get_persons_from_fiks(cloud_event):
    start_uttrekk_jobb(cloud_event=cloud_event)
