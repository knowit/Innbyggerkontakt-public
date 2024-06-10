# SMS Tester
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

This service is meant to run as a [GCP](https://cloud.google.com/) Cloud Function v2.

The purpose of the module is to prepare the data required in order to send SMS through the telecommunications api. It is supposed to be used for testing purposes only, to validate the format of an SMS.

## Trigger
Calls through HTTPS allow for swift tests of an SMS from the webapp. Safety measures are implemented with CORS restrictions and `Firebase` token validations. The requests are supposed to be sent from confirmed domains in this project.

## Execution
1. Examines the HTTPS request.
2. Validates the Firebase token.
3. Retrieves the necessary data of the organization.
4. Sends the SMS to the provided phone number with the message after validation.

## Entrypoint
The entrypoint for the HTTPS request is in the `main.py` file. The function's name is `send_test_sms`.

## Expected data of HTTPS
Expected format:

``` json
{
    "message": "String",
    "to": ["String"]  // Phone numbers
}
```

## Environment variables
```yml
SINCH_REGION
SINCH_ENDPOINT
GCP_PROJECT
CORS
```
