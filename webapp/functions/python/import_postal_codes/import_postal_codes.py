# pylint: disable=W0613
"""Message trigger."""
import os
from itertools import groupby

import firebase
import requests

from models.postal_code_model import PostalCodeElement


def organize_response(response):
    """Organizes line into class."""
    text = response.text.split('\r\n')
    postal_data_array = [text_line.split('\t') for text_line in text]
    # Alle verdier skal være definert
    return [
        PostalCodeElement(
            postalCode=postal_data[0],
            postalArea=postal_data[1],
            municipalityNumber=postal_data[2],
            municipalityName=postal_data[3],
            category=postal_data[4],
        )
        for postal_data in postal_data_array
    ]


def import_postal_codes(request):
    """Triggered by cron job defined in cloud scheduler."""
    # TODO: define cronjob
    db = firebase.db
    response = requests.get(os.getenv('BRING_POSTAL_CODE_DOCUMENT'))
    organized_response = organize_response(response)
    organized_response.sort(
        key=lambda postal_code_element: int(postal_code_element.municipality_number)
    )
    groups = groupby(
        organized_response, lambda post_code: post_code.municipality_number
    )
    batch_array = []
    for index, (municipality, postal_code_data) in enumerate(groups):
        if index + 1 >= len(batch_array) * 500:
            batch_array.append(db.batch())
        muni_ref = db.collection('postalCodeData').document(municipality)
        batch_array[-1].set(
            muni_ref,
            {'postalCodes': [str(data.postal_code) for data in postal_code_data]},
        )

    for batch in batch_array:
        batch.commit()
