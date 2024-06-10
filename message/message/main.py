"""Message main method."""
import json
import os
from typing import Dict

import pandas as pd
from innbyggerkontakt.common.utils import divide_list
from innbyggerkontakt.gcp import utils
from innbyggerkontakt.models.basic_persons import PersonWithNameAndEmail
from innbyggerkontakt.models.person_list import PersonList
from krr.krr import get_krr_persons
from mailjet.mailjet import Mailjet, send_single
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.cloud_trace_propagator import CloudTraceFormatPropagator
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from models.freg import FregPerson
from models.krr import KrrPerson, Reservasjon
from models.krr import Status as KrrStatus
from models.mailjet import MailjetPerson
from models.matrikkel import MatrikkelPerson
from models.outcome import OutcomeData, PubsubOutcome
from models.request import Data, RequestBody
from models.request import Status as RequestStatus


set_global_textmap(CloudTraceFormatPropagator())

tracer_provider = TracerProvider()
cloud_trace_exporter = CloudTraceSpanExporter()
tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))
trace.set_tracer_provider(tracer_provider)
#  tracer = trace.get_tracer(__name__)  # TODO(ASN): If not needed, delete.

RequestsInstrumentor().instrument(tracer_provider=tracer_provider)

bucket = os.getenv('GCLOUD_PROJECT')
mailjet_task_queue = os.getenv('MAILJET_TASK_QUEUE')
region = os.getenv('APP_ENGINE_REGION')
BATCH_SIZE = 1000


def filter_persons(dataframe) -> Dict[str, pd.DataFrame]:
    """
    Filter persons based on status and reservasjon.

    Returns 4 dataframes - not_reserved, reserved, not_registered, deleted.
    """
    not_reserved = dataframe[
        (dataframe.status == KrrStatus.AKTIV)
        & (dataframe.reservasjon == Reservasjon.NEI)
    ]
    reserved = dataframe[
        (dataframe.status == KrrStatus.AKTIV)
        & (dataframe.reservasjon == Reservasjon.JA)
    ]
    not_registered = dataframe[dataframe.status == KrrStatus.IKKE_REGISTRERT]
    deleted = dataframe[dataframe.status == KrrStatus.SLETTET]

    return {
        'not_reserved': not_reserved,
        'reserved': reserved,
        'not_registered': not_registered,
        'deleted': deleted,
    }


def send_test(body: Data):
    """Send test email."""
    custom_campaign = bool(body.status not in [RequestStatus.TEST, RequestStatus.DRAFT])
    task = send_single(
        body.person,
        body.content,
        body.template_application,
        body.identifiers,
        custom_campaign=custom_campaign,
    )
    cloud_task = utils.CloudTasks(mailjet_task_queue, region)
    cloud_task.add_to_queue(task.url, headers=task.headers, body=task.body)


def process_batch(persons_batch, body, cloud_task, publisher, batch_number):
    """Prepare and send mailjet api requests for each person in batch."""
    if not persons_batch:
        raise Exception(message='Empty list')
    if all(isinstance(x, FregPerson) for x in persons_batch):
        mailing_list = get_mailing_list_from_freg(
            persons_batch, body, batch_number, publisher
        )
    elif all(isinstance(x, MatrikkelPerson) for x in persons_batch):
        mailing_list = get_mailing_list_from_matrikkel(
            persons_batch, body, batch_number, publisher
        )
    elif all(isinstance(x, PersonWithNameAndEmail) for x in persons_batch):
        mailing_list = PersonList(
            persons=[MailjetPerson.parse_obj(p) for p in persons_batch]
        )
    else:
        raise Exception(message='Not uniform or unsupported type of person.')

    mailjet = Mailjet(
        mailing_list=mailing_list,
        content=body.content,
        template_application=body.template_application,
        identifiers=body.identifiers,
    )

    tasks = mailjet.generate_request(sandbox_mode=body.sandbox_mode)
    for task in tasks:
        cloud_task.add_to_queue(
            os.getenv('MAILJET_PROXY'),
            headers=task.headers,
            body=task.body,
            service_account_email=os.getenv('SERVICE_ACCOUNT'),
        )


def get_mailing_list_from_freg(batch, body, batch_number, publisher):
    """Get freg from GCP bucket."""
    freg = {person.freg_identifier: person for person in batch}
    dataframe = generate_krr_dataframe(body, freg)

    filtered_persons = filter_persons(dataframe)

    if body.file_path:
        upload_to_bucket(body, batch_number, filtered_persons)

    recipients_contact_info = filtered_persons['not_reserved']
    if body.ignore_reservation:
        recipients_contact_info = pd.concat(
            [filtered_persons['not_reserved'], filtered_persons['reserved']]
        )

    mailing_list = PersonList(persons=[])
    for nnid, krr in recipients_contact_info.iterrows():
        krr_person = KrrPerson.parse_obj(krr)
        if not krr_person.kontaktinformasjon.epostadresse:
            continue
        mailjet_person = MailjetPerson.from_krr_and_freg(
            krr_person=krr_person, freg_person=freg[nnid]
        )
        mailing_list.persons.append(mailjet_person)

    log = OutcomeData(
        not_reserved=len(filtered_persons['not_reserved']),
        reserved=len(filtered_persons['reserved']),
        not_active=len(filtered_persons['not_registered']),
        deleted=len(filtered_persons['deleted']),
        mails_sent=len(recipients_contact_info),
    )

    pubsub_message = PubsubOutcome(
        data=log,
        bulletin_id=body.identifiers.bulletin_id,
        organization_id=body.identifiers.organization_id,
    )

    publisher.publish_message(**pubsub_message.dict())

    return mailing_list


def get_mailing_list_from_matrikkel(batch, body, batch_number, publisher):
    """Get freg from GCP bucket."""
    matrikkel = {person.freg_identifier: person for person in batch}
    dataframe = generate_krr_dataframe(body, matrikkel)

    filtered_persons = filter_persons(dataframe)

    if body.file_path:
        upload_to_bucket(body, batch_number, filtered_persons)

    recipients_contact_info = filtered_persons['not_reserved']
    if body.ignore_reservation:
        recipients_contact_info = pd.concat(
            [filtered_persons['not_reserved'], filtered_persons['reserved']]
        )

    mailing_list = PersonList(persons=[])
    for nnid, krr in recipients_contact_info.iterrows():
        krr_person = KrrPerson.parse_obj(krr)
        if not krr_person.kontaktinformasjon.epostadresse:
            continue

        mailjet_person = MailjetPerson.from_krr_and_matrikkel(
            krr_person=krr_person, matrikkel_person=matrikkel[nnid]
        )
        mailing_list.persons.append(mailjet_person)

    log = OutcomeData(
        not_reserved=len(filtered_persons['not_reserved']),
        reserved=len(filtered_persons['reserved']),
        not_active=len(filtered_persons['not_registered']),
        deleted=len(filtered_persons['deleted']),
        mails_sent=len(recipients_contact_info),
    )

    pubsub_message = PubsubOutcome(
        data=log,
        bulletin_id=body.identifiers.bulletin_id,
        organization_id=body.identifiers.organization_id,
    )

    publisher.publish_message(**pubsub_message.dict())

    return mailing_list


def generate_krr_dataframe(body, freg):
    """Ask krr for contact info and converts it into a dataframe."""
    contact_info = get_krr_persons(
        list(freg.keys()),
        body.content.default_language,
        body.identifiers.organization_id,
    )

    _dict = {p.personidentifikator: p.dict() for p in contact_info.persons}
    dataframe = pd.DataFrame.from_dict(_dict, orient='index')

    return dataframe


def upload_to_bucket(body, batch_number, filtered_persons: Dict):
    """Upload mailjet data to bucket."""
    cloud_storage = utils.CloudStorage(bucket)
    file_name = (
        f'krr/{body.identifiers.bulletin_id}/'
        f"{body.file_path.split('/')[-1].split('.')[0]}_{batch_number}.json"
    )
    data = {key: item.to_dict() for key, item in filtered_persons.items()}
    cloud_storage.upload_file_to_bucket(file_name, data)


def message(request):
    """
    Fetch contact info from krr and creates mailjet requests with personalized emails.

    Returns OK, 200
    """
    data = RequestBody(**json.loads(request.data))
    body = data.data
    if body.status:
        send_test(body)
        return 'OK', 200

    if body.file_path:
        cloud_storage = utils.CloudStorage(bucket)
        _raw_person_list = cloud_storage.get_file_from_bucket(body.file_path)
        person_list = PersonList(persons=_raw_person_list)
    else:
        person_list = PersonList(persons=[body.person])

    cloud_task = utils.CloudTasks(mailjet_task_queue, region)
    publisher = utils.Publisher(os.getenv('OUTCOME_TOPIC'))
    for batch_number, persons_batch in enumerate(
        divide_list(person_list.persons, BATCH_SIZE)
    ):
        process_batch(persons_batch, body, cloud_task, publisher, batch_number)

    if data.index + 1 == data.total and body.file_path:
        publish_status = utils.Publisher(os.getenv('MESSAGE_STATUS_TOPIC'))
        publish_status.publish_message(
            data={},
            status='done',
            bulletin_id=body.identifiers.bulletin_id,
            organization_id=body.identifiers.organization_id,
        )
    return 'OK', 200
