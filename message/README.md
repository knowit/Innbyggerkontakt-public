# Message
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)

This is a two part service, where one is triggered by the other ([Message](https://github.com/knowit/Innbyggerkontakt-public/tree/78ecc519dccb8b9da3ec86735a8803edb0c138d0/message/message) -> [Proxy](https://github.com/knowit/Innbyggerkontakt-public/tree/78ecc519dccb8b9da3ec86735a8803edb0c138d0/message/proxy)). The purpose of these modules is to prepare data and send a request to the [Mailjet](https://www.mailjet.com/) API which sends out emails to the recipients.

The next sections will present each module individually.

## Message
Message is triggered by an authenticated http-request from `Cloud Tasks` generated by [Message trigger](https://github.com/knowit/Innbyggerkontakt-public/tree/master/webapp/functions/python#message-trigger).
Message will fetch recipients data from `Cloud Storage` and request contact-information from KRR (kontakt- og reservasjonsregisteret) before adding a generated Mailjet request to `Cloud Tasks`.

### Environment variables used
```yml
GCLOUD_PROJECT = "innbyggerkontakt-dev"
MAILJET_TASK_QUEUE = "GET_FROM_GCP"
APP_ENGINE_REGION = "europe-west3"
MAILJET_PROXY = "GET_FROM_GCP" # mailjet_proxy_endpoint
KRR_ENDPOINT = "https://test.kontaktregisteret.no"
KRR_SCOPE = "global/kontaktinformasjon.read"
```
## Proxy
Proxy is triggered by an authenticated http-request from `Cloud Tasks` generated by Message as mentioned above. It handles Mailjet requests and responses.

## Setup
```bash
# Install dependencies
pip install -r requirements_test.txt
```
