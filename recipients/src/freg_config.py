"""Configurations"""
import os
from posixpath import join as urljoin


scopes = ['ks:fiks']

# File paths
FREG_UTTREKK_PATH = 'freg/{}/{}'
FREG_UTTREKK_FILE = '{}.json'

# Freg enpoints
FIKS_URL = urljoin(os.getenv('FIKS_ENDPOINT', ''), 'folkeregister/api/v1/{}/')
SOEK_URL = urljoin(FIKS_URL, 'v1/personer/soek')
UTTREKK_URL = urljoin(FIKS_URL, 'v1/uttrekk/tilpasset')
UTTREKK_BATCH_URL = urljoin(FIKS_URL, 'v1/uttrekk/{}/batch/{}')
BULKOPPSLAG_URL = urljoin(FIKS_URL, 'v1/personer/bulkoppslag')
HENDELSER_SISTE_SEKVENSNUMMER = urljoin(FIKS_URL, 'v1/hendelser/siste/sekvensnummer')
HENDELSER_FEED = urljoin(FIKS_URL, 'v1/hendelser/feed')
HENDELSER_SINGLE = urljoin(FIKS_URL, 'v1/hendelser/{}')
HENDELSER_BATCH = urljoin(FIKS_URL, 'v1/hendelser/bulkoppslag')
ENKELPERSON = urljoin(FIKS_URL, 'v1/personer/{}')
ARKIV_BATCH = urljoin(FIKS_URL, 'v1/personer/bulkoppslag/arkiv')


# Digdir endpoints
MASKINPORTEN_CONFIG_URL = urljoin(
    os.getenv('MASKINPORTEN_URL', ''), '.well-known/oauth-authorization-server'
)

# Freg post request
MAX_POST_REQUEST_SIZE = 1000

FREG_BATCH_SIZE = 10000


# pub/sub
RECIPIENTS_STATUS_TOPIC = os.getenv('RECIPIENTS_STATUS_TOPIC', '')
FREG_EVENT_TOPIC = os.getenv('FREG_EVENT_TOPIC', '')
OUTCOME_TOPIC = os.getenv('OUTCOME_TOPIC', '')


# Cloud run recipients url
RECIPIENTS_FEED = (
    'https://{hostname}/freg/events/feed/{seq}?previous_seq={previous_seq}'  # noqa
)


# Freg event sequence number bucket location
# For the temporary fix for multiple event feeds, the middle variable was added
GENERAL_LAST_SEQUENCE_LOCATION = 'freg_events/last_sequence_number.txt'
LAST_SEQUENCE_LOCATION = 'freg_events/{org_id}/last_sequence_number.txt'
LIST_OF_ORGANIZATIONS = 'freg_events/list_of_orgs.json'
