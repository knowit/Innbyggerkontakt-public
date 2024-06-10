"""Client used with sms."""
import os

import requests
from freg_models.folkeregisteret.tilgjengeliggjoering.uttrekk.v1.request import (
    Kommunenummer,
    PersonstatustyperEnum,
    TilpassetUttrekkJobbRequest,
)
from google.cloud import pubsub_v1
from ps_message.freg_fetch_jobbid import FregFetchJobbid

from models.bulletin import Bulletin, Query


SEARCH = '/freg/search/{bulletin_id}'
RECIPIENTS_URL = os.getenv('RECIPIENTS_URL')


def _get_kommunenummer(
    kommunenummer: str, include_opphold: bool = False
) -> Kommunenummer:
    if include_opphold:
        return Kommunenummer(
            oppholdskommunenummer=kommunenummer, bostedskommunenummer=kommunenummer
        )
    else:
        return Kommunenummer(bostedskommunenummer=kommunenummer)


def convert_query_to_freg_uttrekk_request(
    query: Query, kommunenummer: str
) -> TilpassetUttrekkJobbRequest:
    """Return a UttrekkJobbRequest from a query and kommunenummer.

    In order to do a cleanly call freg_fetch_jobbid we need a proper request.
    """
    print(f'convert_query_to_freg_uttrekk_request query: {query}')
    return TilpassetUttrekkJobbRequest(
        foedselsaarFraOgMed=getattr(query.age, 'year_of_birth_from', None),
        foedselsaarTilOgMed=getattr(query.age, 'year_of_birth_to', None),
        kjoenn=query.gender,
        personstatustyper=[PersonstatustyperEnum.bosatt],
        sivilstandstype=query.marital_status_types,
        kommunenummer=_get_kommunenummer(
            kommunenummer, include_opphold=query.include_residing_address
        ),
    )


def make_all_sms_calls(bulletin: Bulletin, bulletin_id: str, organization_id: str):
    """
    Take a bulletin and pubsub messages.

    One for each query and one for each language (this is a future feature).
    """
    print(f'make all sms calls bulletin: {bulletin}')
    for query in bulletin.recipients.query:
        _tujr = convert_query_to_freg_uttrekk_request(
            query=query, kommunenummer=bulletin.kommunenummer
        )
        for (
            lang_content_key,
            lang_content_value,
        ) in bulletin.sms_content.items():  # Should only be one per now.
            _make_sms_pubsub_call(
                bulletin_id=bulletin_id,
                organization_id=organization_id,
                sms_content=lang_content_value,
                sms_content_lang=lang_content_key,
                tilpasset_uttrekk_jobb_request=_tujr,
            )

    _update_bulletin_status(bulletin_id=bulletin_id, organization_id=organization_id)


def _make_sms_pubsub_call(
    bulletin_id: str,
    organization_id: str,
    sms_content: str,
    sms_content_lang: str,
    tilpasset_uttrekk_jobb_request: TilpassetUttrekkJobbRequest,
) -> requests.Response:
    """Do a search in recipients."""
    publisher = pubsub_v1.PublisherClient()
    project_id = os.getenv('GCLOUD_PROJECT')
    sms_topic = os.getenv('FETCH_JOBB_ID_TOPIC')
    data = FregFetchJobbid(
        bulletin_id=bulletin_id,
        organization_id=organization_id,
        sms_content=sms_content,
        sms_lang=sms_content_lang,
        freg_filter=tilpasset_uttrekk_jobb_request,
    )
    topic_path = publisher.topic_path(project=project_id, topic=sms_topic)
    future = publisher.publish(
        topic=topic_path, data=data.encode_for_pubsub(), origin='instant'
    )
    return future.result()


def _update_bulletin_status(bulletin_id: str, organization_id: str):
    publisher = pubsub_v1.PublisherClient()
    project_id = os.getenv('GCLOUD_PROJECT')
    message__status_topic = os.getenv('MESSAGE_STATUS_TOPIC')

    topic_path = publisher.topic_path(project=project_id, topic=message__status_topic)
    publisher.publish(
        topic=topic_path,
        data=b'',
        status='done',
        organization_id=organization_id,
        bulletin_id=bulletin_id,
    )
