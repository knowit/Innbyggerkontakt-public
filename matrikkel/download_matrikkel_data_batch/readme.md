## Get phone numbers from krr
This service is ment to run as a gcp cloud function v2.

This module downloads max 5000 matrikkel units from a municipality.
First triggered by the cron job: download_matrikkel_data_job.
If there are more than 5000 matrikkel units in the municipality it triggeres itself via the pubsub-topic: DOWNLOAD_MATRIKKEL_DATA_BATCH_TOPIC until all matrikkel units it downloaded.

To generate requirements.txt run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
*NB*: After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses `poetry` to handle dependencies.
