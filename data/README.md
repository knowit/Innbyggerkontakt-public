# Setup
Install with either:
* `pip install . -e`
* `pip install neworg --extra-url=`
* `poetry install https://europe-west3-python.pkg.dev/innbyggerkontakt-dev/ik-python-repo/simple/`

Alternatively, run without installing:
* `poetry run neworg`

Run with the command `neworg` to see a list of commands and further help.

-----
## Old setup
This module depends on the steps from the backend setup of the [root README](https://github.com/knowit/Innbyggerkontakt-public/blob/master/README.md).

## Installing dependencies
	pip install -r requirements.txt

## Uploading and downloading data

The script [firestore.py](https://github.com/knowit/Innbyggerkontakt-public/blob/master/data/neworg/firestore.py) can be used for uploading and downloading data.

Modes:
* Standard mode is uploading, state the document, collection, and json-data file
* There is a mode for downloading data, state collection and `--get`
* There is also a mode for deleting

Example:

    python3 firestore.py --get -c bulletin

## Data migration for production

* Upload new data
* Update demo-organization with new/changed templates
* Run script to copy data to new structures
* When all is tested, and no bugs are found, run the deletion scripts for old data
