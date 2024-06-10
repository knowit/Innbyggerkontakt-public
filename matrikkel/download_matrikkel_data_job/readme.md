## Download matrikkel data job
This service is ment to run as a gcp cloud function v2.

This module triggers download_matrikkel_data_batch for every municipality number in firestore.

To generate requirements.txt run:
``` bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```
*NB*: After this, manually copy --index-url and remove -dev such that it also works in prod.

This project uses `poetry` to handle dependencies.
