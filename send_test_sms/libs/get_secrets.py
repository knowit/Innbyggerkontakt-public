"""Util function to retrieve secrets."""
import logging
import os

from google.cloud.secretmanager import SecretManagerServiceClient


def get_secrets(secret_id) -> str | None:
    """Function for getting secrets from gcp secrets manager."""
    try:
        project_id = os.getenv('GCP_PROJECT')
        client = SecretManagerServiceClient()
        name = client.secret_version_path(
            project=project_id, secret=secret_id, secret_version='latest'
        )

        response = client.access_secret_version(name=name)

        return response.payload.data.decode('UTF-8')
    except RuntimeError as e:
        logging.error(e)
        return
