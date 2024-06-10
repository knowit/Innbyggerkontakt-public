"""Configurations"""
import os
from posixpath import join as urljoin


MATRIKKEL_UTTREKK_FILE = '{}.json'
# Matrikkel wsdl-endpoints
# TODO skille på test og prod på matrikkelendpoint
MATRIKKEL_URL = urljoin(os.getenv('MATRIKKEL_ENDPOINT', ''), 'matrikkelapi/wsapi/v1')
KOMMUNE_WSDL_URL = urljoin(MATRIKKEL_URL, 'KommuneServiceWS?WSDL')
STORE_WSDL_URL = urljoin(MATRIKKEL_URL, 'StoreServiceWS?wsdl')
BYGG_WSDL_URL = urljoin(MATRIKKEL_URL, 'BygningServiceWS?WSDL')
ADRESSE_WSDL_URL = urljoin(MATRIKKEL_URL, 'AdresseServiceWS?WSDL')
MATRIKKEL_WSDL_URL = urljoin(MATRIKKEL_URL, 'MatrikkelenhetServiceWS?WSDL')

MATRIKKEL_BATCH_SIZE = 10000
# pub/sub
# RECIPIENTS_STATUS_TOPIC = os.getenv('RECIPIENTS_STATUS_TOPIC', '')
# OUTCOME_TOPIC = os.getenv('OUTCOME_TOPIC', '')
