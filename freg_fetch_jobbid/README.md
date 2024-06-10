# FREG fetch jobbid
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

This service is meant to run as a [GCP](https://cloud.google.com/) Cloud Function v2.

The purpose of the module is to create and send a query to [FREG](https://www.ks.no/fagomrader/digitalisering/felleslosninger/modernisert-folkeregister/), and send the returning `jobb_id` to the next module.

## Trigger
This service is triggered by the handler of a `Firestore` event, namely [firestore_trigger](https://github.com/knowit/Innbyggerkontakt-public/tree/master/webapp/functions/python/firestore_trigger). It retrieves a `Pub/Sub` message containing a `bulletin_id`, `filter` for the query, and other information.

## Execution
With the `filter`, the module authenticates, constructs the query, and sends the request to [FREG](https://www.ks.no/fagomrader/digitalisering/felleslosninger/modernisert-folkeregister/) with the *tilpassetUttrekk* endpoint. The result will be a `jobb_id` which is an ID necessary to fetch a batch created by [FREG](https://www.ks.no/fagomrader/digitalisering/felleslosninger/modernisert-folkeregister/). Depending on the status of the `jobb_id`, different responses are expected.

After getting the `jobb_id`, a `Pub/Sub` message is sent to [freg_batch_getter](https://github.com/knowit/Innbyggerkontakt-public/tree/master/freg_batch_getter) with the first `batch number`, which handles rest of the process.

## Entrypoint
The entrypoint of the event is in the `main.py` file. The function's name is `handler`.

## Various information

### Update requirements.txt
To generate requirements.txt, run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
>PS! After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses [Poetry](https://python-poetry.org/) to handle dependencies.
