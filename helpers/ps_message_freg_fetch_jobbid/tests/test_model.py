import pytest
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.request import (
    Kommunenummer,
    PersonstatustyperEnum,
    TilpassetUttrekkJobbRequest,
)
from ps_message.freg_fetch_jobbid import FregFetchJobbid
from pydantic import ValidationError


@pytest.fixture
def snake_case_dict():
    yield {
        'bulletin_id': 'ENDQj8DwagBGWxnQjBUq',
        'organization_id': 'development',
        'sms_content': 'asddsfdsafsda',
        'sms_lang': 'nb',
        'freg_filter': {
            'foedselsaar_fra_og_med': '1947',
            'foedselsaar_til_og_med': '1949',
            'kommunenummer': {'bostedskommunenummer': '0301'},
            'personstatustyper': ['bosatt'],
        },
        'disable_one_kommune_check': False,
        'does_not_exists': 345,
    }


@pytest.fixture
def camel_case_dict():
    yield {
        'bulletinId': 'ENDQj8DwagBGWxnQjBUq',
        'organizationId': 'development',
        'smsContent': 'asddsfdsafsda',
        'smsLang': 'nb',
        'fregFilter': {
            'foedselsaarFraOgMed': '1947',
            'foedselsaarTilOgMed': '1949',
            'kommunenummer': {'bostedskommunenummer': '0301'},
            'personstatustyper': ['bosatt'],
        },
        'disableOneKommuneCheck': False,
    }


def test_do_not_send_to_whole_kingdom():
    with pytest.raises(ValidationError):
        FregFetchJobbid(
            bulletin_id='1234',
            organization_id='rewq',
            sms_content='Hello NOT ENTIRE Norway',
            sms_lang='gb',
            freg_filter=TilpassetUttrekkJobbRequest(
                personstatustyper=[PersonstatustyperEnum.bosatt]
            ),
        )


def test_have_to_explicitly_order_to_send_to_all_kommuner():
    ffj = FregFetchJobbid(
        bulletin_id='1234',
        organization_id='rewq',
        sms_content='Hello entire Norway',
        sms_lang='gb',
        freg_filter=TilpassetUttrekkJobbRequest(
            personstatustyper=[PersonstatustyperEnum.bosatt]
        ),
        disable_one_kommune_check=True,
    )
    assert ffj is not None
    assert ffj.freg_filter.kommunenummer is None


@pytest.mark.parametrize(
    'kommune',
    [
        Kommunenummer(bostedskommunenummer='9999'),
        Kommunenummer(oppholdskommunenummer='9999'),
    ],
)
def test_normal_assert_with_kommunenummer(kommune):
    ffj = FregFetchJobbid(
        bulletin_id='1234',
        organization_id='rewq',
        sms_content='Hello entire Norway',
        sms_lang='gb',
        freg_filter=TilpassetUttrekkJobbRequest(
            personstatustyper=[PersonstatustyperEnum.bosatt],
            kommunenummer=kommune,
        ),
        disable_one_kommune_check=True,
    )
    assert ffj is not None
    assert ffj.freg_filter.kommunenummer == kommune


def test_allow_snake_case_on_fields(snake_case_dict, camel_case_dict):
    ss_massage = FregFetchJobbid(**snake_case_dict)
    cc_message = FregFetchJobbid(**camel_case_dict)

    assert ss_massage.freg_filter.foedselsaar_til_og_med == '1949'
    assert ss_massage.freg_filter.foedselsaar_fra_og_med == '1947'

    assert ss_massage.json() == cc_message.json()


def test_not_a_perfect_filter__should_fail(snake_case_dict):
    misspelled_filter = {
        'Xoedselsaar_til_og_med': '1949',
        'kommunenummer': {'bostedskommunenummer': '0301'},
        'personstatustyper': ['bosatt'],
    }
    snake_case_dict['freg_filter'] = misspelled_filter.copy()
    with pytest.raises(ValidationError):
        FregFetchJobbid(**snake_case_dict)
