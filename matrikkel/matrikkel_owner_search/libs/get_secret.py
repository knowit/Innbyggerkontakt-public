"""A function for getting secrets from gcp secrets manager."""
import logging
import os

from google.cloud.secretmanager_v1 import SecretManagerServiceClient


def get_secret(secret_id):
    """Function for getting secrets from gcp secrets manager."""
    try:
        project_id = os.getenv('GCP_PROJECT', '')
        client = SecretManagerServiceClient()
        name = client.secret_version_path(
            project=project_id, secret=secret_id, secret_version='latest'
        )

        response = client.access_secret_version(name=name)

        return response.payload.data.decode('UTF-8')
    except RuntimeError as e:
        logging.error(e)
        return
