"""Module for freg_fetch_jobbid."""
from typing import Dict

from cloud_event_model import JsonModel
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.request import (
    TilpassetUttrekkJobbRequest,
)
from pydantic import Extra, root_validator


TilpassetUttrekkJobbRequest.__config__.allow_population_by_field_name = True
TilpassetUttrekkJobbRequest.__config__.extra = Extra.forbid


class FregFetchJobbid(JsonModel):
    """Pub/Sub message class for Freg Fetch Jobbid."""

    bulletin_id: str
    organization_id: str
    sms_content: str
    sms_lang: str
    freg_filter: TilpassetUttrekkJobbRequest
    disable_one_kommune_check: str = False

    @root_validator
    def check_kommunenr(cls, values: Dict):
        """Check that kommunenummer is set.

        To disable this validation, set `disable_one_kommune_check to `True`.
        This validation is in place in order not to get persons from the whole country.
        """
        if values['disable_one_kommune_check']:
            return values
        freg_filter: TilpassetUttrekkJobbRequest = values['freg_filter']
        assert freg_filter.kommunenummer, '`freg_filter` does not contain kommunenummer'
        if (
            not freg_filter.kommunenummer.bostedskommunenummer
            and not freg_filter.kommunenummer.oppholdskommunenummer
        ):
            raise AssertionError('`freg_filter.kommune` contains only empty values.')
        return values
