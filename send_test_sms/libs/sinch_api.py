"""Functions for communicating with the Sinch Api."""

import logging
import os

from requests import post
from requests.exceptions import Timeout

from libs.get_secrets import get_secrets

from models.sms_test_request import SMSTestRequest


def send_sms(
    sms_test_request: SMSTestRequest,
):
    """Prepares the url, headers and payload for the SMS api and sends the request."""
    payload = {
        'from': sms_test_request.from_name,
        'to': sms_test_request.to,
        'body': sms_test_request.message,
    }
    url = get_url()
    headers = get_headers()
    try:
        send_request(url=url, headers=headers, payload=payload)
    except AttributeError as e:
        logging.exception('Attribute error during posting of sms to Sinch: %s', e)
    except Timeout as e:
        logging.exception('Timeout during posting of sms to Sinch: %s', e)
        raise e


def send_request(
    url: str,
    headers: dict,
    payload: dict,
):
    """Send the request and handles depending on response."""
    response = post(url=url, headers=headers, json=payload, timeout=300)
    data = response.json()

    match response.status_code:
        case status if 199 < status < 299:  # noqa: E0601
            logging.warning('Success.')
            return
        case status if 399 < status < 429:
            logging.exception('Invalid request: %s', data)
        case status if 499 < status:
            logging.exception('Server error fom api: %s', data)
            return response.raise_for_status()
        case _:
            logging.exception('Unknown status code: %s', data)
            return response.raise_for_status()


def get_url():
    """Generates the target url for communicating with the api."""
    service_plan_id = get_secrets('SINCH_SERVICE_PLAN_ID')
    region = os.getenv('SINCH_REGION')
    endpoint = os.getenv('SINCH_ENDPOINT')

    if service_plan_id is None:
        raise ValueError('No service plan id found')

    return f'https://{region}.sms.api.sinch.com/xms/v1/{service_plan_id}/{endpoint}'


def get_headers():
    """Generates the headers for communicating with the api."""
    token = get_secrets('SINCH_TOKEN')

    if token is None:
        raise ValueError('No service token found')

    headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}
    return headers
