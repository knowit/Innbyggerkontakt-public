# FREG batch getter
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

This service is meant to run as a [GCP](https://cloud.google.com/) Cloud Function v2.

The purpose of the module is to fetch batches from [FREG](https://www.ks.no/fagomrader/digitalisering/felleslosninger/modernisert-folkeregister/) and pass information about the batch to the next function.

## Trigger
This module is triggered by [freg_fetch_jobbid](https://github.com/knowit/Innbyggerkontakt-public/tree/master/freg_fetch_jobbid). It retrieves a `Pub/Sub` message containing a `jobb_id` and a `batch number`.

## Execution
With the `jobb_id` and the `batch number`, the module will call the `hentBatch` endpoint at FREG: `/v1/uttrekk/{jobbid}/batch/{batchnr}`. In return, it gets a list of **N**ational **ID**entity **N**umbers (nids) in a `UttrekkDataResponse` object. This result is processed and stored inside a bucket with path `$project_id/sms-nids/$organization/$bulletId/$jobbId/$batchNr.json`.

After the file is stored in the bucket, this function triggers [get_phone_numbers_from_krr](https://github.com/knowit/Innbyggerkontakt-public/tree/master/get_phone_numbers_from_krr) which will retrieve the contact information of the recipients from the bucket.

## Entrypoint
The entrypoint of the event is in the `main.py` file. The function's name is `fetch_batch`.

## Various information
### Schema:

``` yml
folkeregisteret.tilgjengeliggjoering.uttrekk.v1.response.UttrekkDataResponse:
      title: "UttrekkDataResponse"
      type: "object"
      properties:
        dokumentidentifikator:
          type: "array"
          items:
            type: "string"
        feilmelding:
          type: "string"
        foedselsEllerDNummer:
          type: "array"
          items:
            type: "string"
```

### Update requirements.txt
To generate requirements.txt, run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
>PS! After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses [Poetry](https://python-poetry.org/) to handle dependencies.
