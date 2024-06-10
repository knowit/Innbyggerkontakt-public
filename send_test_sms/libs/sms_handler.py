"""The function that starts the SMS handling system."""
import logging

from phone_validator_models.phone_validator_models import Telefonnummer
from pydantic import ValidationError

from libs import firebase, get_from_name, sinch_api

from models.sms_test_request import SMSTestRequest


@firebase.authenticate(get_user_as_kwarg='firebase_user')
def sms_handler(request, firebase_user: firebase.User = None):
    """A function for processing the HTTP Post request and sending the sms through an SMS API.
    Requires authentication from Firebase and CORS policies.
    """
    data = 'Invalid request'
    try:
        data = request.get_json()
        shortCode = get_from_name.get_from_name(firebase_user.organization_id)
        to: list[str] = normalize_numbers(data['to'])

        sms_test_request: SMSTestRequest = SMSTestRequest(
            message=data['message'], to=to, from_name=shortCode
        )

        sinch_api.send_sms(sms_test_request)

        return 'ok', 200
    except ValidationError as e:
        logging.error(e)
        logging.error('Request: %s', data)
        return 'failed', 400
    except KeyError as e:
        logging.error(e)
        logging.error('Request: %s', data)
        return 'failed', 400


def normalize_numbers(phone_numbers: list[str]) -> list[str]:
    """Normalize phone numbers with `phone_validator_models`."""
    return [Telefonnummer(number=number).number for number in phone_numbers]
