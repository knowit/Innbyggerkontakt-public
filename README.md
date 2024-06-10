# Innbyggerkontakt

[![](https://img.shields.io/badge/GCP-a?style=flat&logo=google-cloud&label=Cloud&color=4285F4&logoColor=ffffff)](https://cloud.google.com/)
[![](https://img.shields.io/badge/Firebase-a?style=flat&logo=firebase&label=Hosting&color=FFCA28&logoColor=ffffff)](https://firebase.google.com/)
[![](https://img.shields.io/badge/Terraform-a?style=flat&logo=terraform&label=IaC&color=7B42BC&logoColor=ffffff)](https://www.terraform.io/)

[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/Typescript-a?style=flat&logo=typescript&label=Code&color=3178C6&logoColor=ffffff)](https://www.typescriptlang.org/)

[![](https://img.shields.io/badge/React-a?style=flat&logo=react&label=Code&color=61DAFB&logoColor=ffffff)](https://reactjs.org/)


## Table of Contents

- [Innbyggerkontakt](#innbyggerkontakt)
  - [Table of Contents](#table-of-contents)
  - [Intro](#intro)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
      - [Install Google Cloud SDK](#install-google-cloud-sdk)
      - [Authorize Cloud SDK](#authorize-cloud-sdk)
    - [Frontend](#frontend)
      - [Webapp](#webapp)
    - [Backend](#backend)
      - [Python](#python)
  - [Backend setup](#backend-setup)
      - [Backend Essential Packages:](#backend-essential-packages)
      - [Pre-commit](#pre-commit)
      - [Flakeheaven and Flake8](#flakeheaven-and-flake8)
      - [Black](#black)
      - [Artifact registry](#artifact-registry)
  - [Guidelines](#guidelines)
    - [General guidelines](#general-guidelines)
    - [Configure VSCode backend (Optional)](#configure-vscode-backend-optional)
    - [Install Docker (Optional)](#install-docker-optional)

## Intro
This is a collaborative project with [KF](https://www.kf.no/). Innbyggerkontakt makes it possible for the users (municipalities++)
to send e-mails and SMSes to all or groups of their citizens that they themselves can specify. It utilizes _Folkeregisteret_,
_Kontakt- og Reservasjonsregisteret_ and _Matrikkelen_ to filter out the specific groups and get the e-mail addresses and phone numbers.

Innbyggerkontakt consists of a frontend and several backend components running on Firebase and Google Cloud Platform (GCP).
The frontend is a webapp written in React and hosted on Firebase. Firebase is also used for storage (using Firestore),
authentication, access control, and event-oriented, asynchronous interactions with Firebase Functions.
Innbyggerkontakt is also integrated with Firebase's Content Delivery Network in order to post pictures and other resources online.
The backend components run on GCP through a combination of Cloud Bucket Storage, App Engine, and Cloud Functions.
It also has an SQL instance.

## Setup
### Prerequisites
#### Install Google Cloud SDK
A link to install the SDK can be found [here](https://cloud.google.com/sdk/install).

#### Authorize Cloud SDK
To authenticate to Google Cloud Platform, write the following into a terminal:
```bash
gcloud auth login
```

### Frontend
#### Webapp
How to set up development on the webapp is explained in detail in the README located inside the [webapp](webapp/README.md) folder.

### Backend
This section will include a general description of necessary tools and recommendations.

#### Python
Depending on what module you are working on in this project, different Python versions are required. The project as a whole is in a process of transitioning from Python 3.7 to Python 3.10 (as of 30. November 2022). Thus, all further development should be implemented in Python 3.10 or higher.

However, in order to execute older modules, Python 3.7 might be required. It is recommended to create a virtual environment for each module required to develop and execute a module in a separate environment.

## Backend setup

#### Backend Essential Packages:

* [FastAPI](https://fastapi.tiangolo.com/)
    * We use FastAPI to develop APIs,  but not used much since we tend to use `Cloud Functions` that are triggered on `Pub/Sub`.
* [Pydantic](https://pydantic-docs.helpmanual.io/)
    * We use Pydantic to create models. Pydantic makes it easy to evaluate, export and import objects.
* [Poetry](https://python-poetry.org/)
    * Used to manage, build and publish Python packages.

If you create a virtual environment in the same place as the source code it is important that you call this `.venv` to not trigger linters etc. This depends on what virtual environment system you choose to use.

[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)

[Poetry](https://python-poetry.org/) is a tool for Python packaging and dependency management. It is used in the latest development to keep track of dependencies and may help to prevent dependency issues. For further development, it is recommended to implement such a tool for consistency and improved safety.

#### Pre-commit
* Install the pre-commit package with: `pip install pre-commit`
* Install the git hooks with `pre-commit install`

#### Flakeheaven and Flake8
* Install flake8 and it's addons
`pip install -r lint-requirements.txt`
#### Black
* Black should be set as the default auto-formatter with skip-string-normalization = 1
`pip install black`

#### Artifact registry
Google Cloud Artifact registry is used to store artifacts in the project.

## Guidelines
### Configure VSCode backend (Optional)
[![](https://img.shields.io/badge/VSCode-a?style=flat&logo=visual-studio-code&label=IDE&color=007ACC&logoColor=ffffff)](https://code.visualstudio.com/)

Innbyggerkontakt repo is a multi-repo, in order to have multiple virtual environments and other containerizations,
we have set up a Multi-root Workspaces schema.
This is our recommended setup for VSCode
```json
"settings": {
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Args": ["--baseline", ""],
}
```
If you want all linting problems, **or**:
```json
    "python.linting.flake8Args": ["--baseline", "/home/full/path/to/Innbyggerkontakt/baseline.txt"],

```
If you only want new linting problems.

### Install Docker (Optional)
[![](https://img.shields.io/badge/Docker-a?style=flat&logo=docker&label=Container&color=2496ED&logoColor=ffffff)](https://www.docker.com/)

* Install [docker-engine](https://docs.docker.com/engine/install/)
* Install [docker-compose](https://docs.docker.com/compose/install/)

---