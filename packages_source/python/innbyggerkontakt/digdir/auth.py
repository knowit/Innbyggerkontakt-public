"""Authenticate against digdir.
Requires two secrest in gcp, CERTIFICATE_PASSWORD and CERTIFICATE"""
import warnings
import time
import uuid
import json
from typing import List
from datetime import datetime, timedelta

import jwt
import requests
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PrivateFormat, NoEncryption

from innbyggerkontakt.gcp.utils import get_secret


class ClientAuthenticationFailed(Exception):
    """Authentication error"""

    def __init__(self, response, message='Authentication failed with response: {}'):
        super().__init__(message.format(response))


class Auth:
    # pylint: disable=too-few-public-methods
    """ config_url: url to digdir config containing ['token_endpoint'] and ['issuer']
        issuer: your digdir client id created in maskinporten
        scopes: access scopes defined in maskinporten digdir client
        iss_onbehalfof: your onbegalfof issuer id defined in maskinporten digdir client """

    def __init__(self, config_url: str, issuer: str, scopes: List[str], iss_onbehalfof: str = None):
        self.password = get_secret('CERTIFICATE_PASSWORD').encode('UTF-8')
        self.issuer = issuer
        self.file_content = get_secret('CERTIFICATE', decode=False)
        self.config = json.loads(requests.get(config_url).content.decode())
        self.scope = " ".join(scopes)
        self.iss_onbehalfof = iss_onbehalfof

    def get_access_token(self):
        """Return access token from digdir"""
        private_key, certificate, _ = pkcs12.load_key_and_certificates(self.file_content, self.password)
        if not certificate.not_valid_before < datetime.now() < certificate.not_valid_after:
            raise ValueError(('Certificate is outside validation dates. Not valid before '
                              f'{certificate.not_valid_before}, not valid after {certificate.not_valid_after}'))
        if certificate.not_valid_after < datetime.now() + timedelta(days=30):
            warnings.warn(f"Certificate expires in {(certificate.not_valid_after - datetime.now()).days}",
                          ResourceWarning)

        private_key_bytes = private_key.private_bytes(Encoding.PEM, PrivateFormat.PKCS8, NoEncryption())
        certificate_bytes = certificate.public_bytes(Encoding.PEM)
        trimmed_certificate = ''.join(certificate_bytes.decode().split('\n')[1:-2])

        header = {
            'x5c': [trimmed_certificate],
            'alg': 'RS256',
        }

        body = {
            'aud': self.config['issuer'],
            'scope': self.scope,
            'iss': self.issuer,
            'iat': int(time.time()),
            'exp': int(time.time() + 120),
            'jti': str(uuid.uuid4())
        }
        if self.iss_onbehalfof:
            body['iss_onbehalfof'] = self.iss_onbehalfof

        encoded = jwt.encode(body, private_key_bytes, headers=header, algorithm='RS256')
        token_endpoint = self.config['token_endpoint']
        request_body = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': encoded
        }
        response = requests.post(token_endpoint, request_body)
        if response.status_code != 200:
            raise ClientAuthenticationFailed(response.json())
        return response.json()['access_token']
