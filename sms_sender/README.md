# SMS Sender
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

This service is meant to run as a [GCP](https://cloud.google.com/) Cloud Function v2.

The purpose of the module is to prepare the data required in order to send SMS through the telecommunications api.

## Trigger
For now, this function is triggered by the [get_phone_numbers_from_krr](https://github.com/knowit/Innbyggerkontakt-public/tree/master/get_phone_numbers_from_krr) -module. The module publishes a message to the `Pub/Sub` topic that this Cloud Function is subscribed to.

## Execution
To prepare the data, this service will do the following:

1. Examines the provided Pub/Sub message.
2. Checks the status of the `messageId` by reading a document in Firestore under the collection `smsEvent`.
    >NB! This is to keep idempotency during failures and concurrent calls to this service.
3. Fetches the message for the bulletin from Firestore.
4. Reads a list of phone numbers at a certain path on Cloud Storage.
5. Retrieves the sender name to be displayed in the SMS based on the `organizationId`.
6. Passes the data mentioned above to the telecommunications api.
7. Stores the result of the request on Firestore.

## Entrypoint
The entrypoint of the event is in the `main.py` file. The function's name is `send_sms`.

## Pub/Sub message format
Expected format of the Pub/Sub message:

``` yml
{
    orgId: string
    bulletinId: string
    objectPath: string
    language: string (Optional, default value is 'nb')
}
```

## Environment variables
```yml
SINCH_REGION
SINCH_ENDPOINT
GCP_PROJECT
```
## Various information
### Update requirements.txt
To generate requirements.txt, run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
>PS! After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses [Poetry](https://python-poetry.org/) to handle dependencies.
