"""This module contains functions to delete all contacts for all sub-accounts."""
import time
from functools import cache

import google.auth
import requests as _requests
from google.cloud import secretmanager
from requests import Response
from requests.auth import HTTPBasicAuth
from requests.exceptions import HTTPError


requests = _requests.Session()


def raise_my_request(r: Response, *_args, **_kwargs):
    """Hook for raising all responses."""
    r.raise_for_status()


requests.hooks['response'].append(raise_my_request)


MAILJET_V3_URL = 'https://api.mailjet.com/v3/REST'
MAILJET_V4_URL = 'https://api.mailjet.com/v4'


@cache
def access_secret(secret_id):
    """Access the payload for the given secret version if one exists."""
    client = secretmanager.SecretManagerServiceClient()
    _, project_id = google.auth.default()
    name = f'projects/{project_id}/secrets/{secret_id}/versions/latest'
    response = client.access_secret_version(request={'name': name})
    return response.payload.data.decode('UTF-8')


@cache
def get_master_auth() -> HTTPBasicAuth:
    """Get master account auth from gcp secrets."""
    key, secret = access_secret('master_mailjet_key'), access_secret(
        'master_mailjet_secret'
    )
    return HTTPBasicAuth(key, secret)


def get_sub_account_auths(auth: HTTPBasicAuth) -> list[tuple[HTTPBasicAuth, str]]:
    """Get all sub-accounts given master-account auth."""
    apikeys_resp = requests.get(
        f'{MAILJET_V3_URL}/apikey', auth=auth, params={'IsMaster': False}
    )
    data = apikeys_resp.json()['Data']
    return [(HTTPBasicAuth(d['APIKey'], d['SecretKey']), d['Name']) for d in data]


def get_contact_id(auth: HTTPBasicAuth):
    """Get all contact ids within one sub-account."""
    url = f'{MAILJET_V3_URL}/contact'
    total = requests.get(url, auth=auth, params={'countOnly': '1'}).json()['Total']
    batch_size = 1000
    contacts = []
    for i in range(1 + int(total) // batch_size):
        params = {'Limit': batch_size, 'Offset': i * batch_size}
        _resp = requests.get(url, auth=auth, params=params)
        data = _resp.json()['Data']
        contacts.extend([user['ID'] for user in data if user['Name'] != 'Anonymized'])
    return contacts


def get_contact_ids(auths: list[HTTPBasicAuth]):
    """Get all contact IDS for all sub-account auths."""
    return [get_contact_id(auth) for auth in auths]


def delete_contact(contact_id: int, auth: HTTPBasicAuth):
    """Delete a contact."""
    requests.delete(f'{MAILJET_V4_URL}/contacts/{contact_id}', auth=auth)


def _handle_error(http_error: HTTPError, err_count: int, sleep_time: int, n_ids: int):
    if http_error.response.status_code == 429 and err_count < 20:
        print(http_error)
        time.sleep(1)
        print(f'{err_count=}, {sleep_time=}, {n_ids=}')
        return 0
    else:
        print('errs to many times, next api-key')
        return 1


def delete_contacts(ids: list[int], auth: HTTPBasicAuth):
    """Delete all contacts in `ids` list one by one.

    Will handle errors and increase delay.
    """
    err_count = 0
    sleep_time = 0.01
    while ids:
        try:
            contact = ids[-1]
            delete_contact(contact, auth)
            time.sleep(sleep_time)
            ids.pop()
        except HTTPError as h_err:
            err_count += 1
            sleep_time *= 1.6
            if _handle_error(h_err, err_count, sleep_time, len(ids)):
                return


def run_auto_delete():
    """Delete all contacts for all sub-accounts."""
    master_auth = get_master_auth()
    sub_auths = get_sub_account_auths(master_auth)
    for auth, auth_name in sub_auths:
        contacts = get_contact_id(auth)
        print(f'found {len(contacts)} contacts for {auth_name}')
        delete_contacts(contacts, auth=auth)


if __name__ == '__main__':
    run_auto_delete()
