# Get phone numbers from krr
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

This service is meant to run as a [GCP](https://cloud.google.com/) Cloud Function v2.

This module gets the phone numbers from [KRR](https://docs.digdir.no/docs/Kontaktregisteret/oppslagstjenesten_rest) (Kontakt- og reservasjonsregisteret), uploads them to storage and publishes a `Pub/Sub` message that triggers the [sms_sender](https://github.com/knowit/Innbyggerkontakt-public/tree/master/sms_sender) module.

## Trigger
This module is triggered by [freg_batch_getter](https://github.com/knowit/Innbyggerkontakt-public/tree/master/freg_batch_getter). It receives a `Pub/Sub` message containing a `bulletin_id`, `jobb_id`, `batch number` and various other information.

## Execution
With all the information mentioned above, the module creates the path to the batch in `Cloud Storage` with the necessary national ids. Then, the service prepares a query for a request towards [KRR](https://docs.digdir.no/docs/Kontaktregisteret/oppslagstjenesten_rest) in order to receive the recipients' contact information.

Afterwards, a JSON file is created and stored at `$project_id/sms-phone-numbers/$organization/$bulletId/$jobbId/$batchNr.json` in `Cloud Storage`. The batches stored in `sms_nids` (NIDS==National Identification numbers / fødselsnummer) are in batches of 5000, but the KRR API accepts batches of 1000. This results in the path mentioned above ending with `\$batchNr_$nr.json`.

At the end on the process, the module will publish a message through `Pub/Sub` to [sms_sender](https://github.com/knowit/Innbyggerkontakt-public/tree/master/sms_sender) with a path created for a batch of 1000 phone numbers.

## Entrypoint
The entrypoint of the event is in the `main.py` file. The function's name is `get_phone_numbers_from_krr`.

## Various information
### Update requirements.txt
To generate requirements.txt, run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
>PS! After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses [Poetry](https://python-poetry.org/) to handle dependencies.
