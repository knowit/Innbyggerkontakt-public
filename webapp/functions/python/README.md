# Webapp Functions
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Firebase-a?style=flat&logo=firebase&label=Hosting&color=FFCA28&logoColor=ffffff)](https://firebase.google.com/)

This directory includes numerous event based functions that are triggered by [Firestore](https://firebase.google.com/products/firestore) events and `Pub/Sub` events. There are some few functions that are exceptions, and more details on these functions can be found further down in this README.

Functions with access to firestore are stored in the same folder since they share the same bulletin models and sometimes need to call one of the other functions. This is apparently the GCP way ¯\\_(ツ)_/¯

>PS! This was done a long time ago, and may not be an optimal solution. Sharing code can be done i other ways, and the close dependency between functions prohibit updates and require a lot of build time when there are smaller changes. Further, readability is not great as the code is now.

## Setup
```bash
# Install requirements
pip install -r requirements_test.txt
```

## Overview

### Firestore active search
* Process new documents in `Firestore`.
* `organization/{org_id}/bulletins/active/search/{bulletin_id}`.
* Schedule bulletin with `Cloud Tasks` if type == 'schedule'.
* Make request to [Recipients](https://github.com/knowit/Innbyggerkontakt-public/tree/master/recipients).

### Firestore active search deleted
* Process deleted documents in `Firestore`.
* `organization/{org_id}/bulletins/active/search/{bulletin_id}`.
* Try to delete any potential scheduled bulletins from `Cloud Tasks`.

### Firestore active event
* Process new documents in `Firestore`.
* `organization/{org_id}/bulletins/active/event/{bulletin_id}`.
* If event_type needs a search in FREG, like 'endringIAlder':
    * Create a `Cloud Scheduler` to make a daily search in FREG.

### Firestore active event deleted
* Process deleted documents in `Firestore`.
* `organization/{org_id}/bulletins/active/event/{bulletin_id}`
* If event_type needs a search in FREG, like 'endringIAlder':
    * Delete `Cloud Scheduler`.

### Scheduled bulletin
* Process scheduled bulletins.
* Triggered by http requests from `Cloud Tasks`.
* Makes request to [Recipients](https://github.com/knowit/Innbyggerkontakt-public/tree/master/recipients).

### Event trigger
* Process `Pub/Sub` events from [Recipients](https://github.com/knowit/Innbyggerkontakt-public/tree/master/recipients).
* If bulletin event document in organization with `municipality_number` and `event_type`:
    * Make request to recipients

### Message trigger
* Process `Pub/Sub` status from [Recipients](https://github.com/knowit/Innbyggerkontakt-public/tree/master/recipients).
* Create `Cloud Tasks` to make requests to [Message](https://github.com/knowit/Innbyggerkontakt-public/tree/master/message).
* Include bulletin data and recipients data.

### Send test
Http request to trigger `Message trigger` with bulletin and recipients. This allows a request with email to test the current content of an email.
