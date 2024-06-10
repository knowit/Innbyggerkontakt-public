# Helpers
This is a directory of numerous private packages that are available in Python and hosted in GCP's [Artifact Registry](https://cloud.google.com/artifact-registry). The reason for these packages are consistency for data models between modules and code reusability.

The next section will include an overview of the available packages and what they do. Finally, the last section will have a general description on how to publish and install these packages with the help of [Poetry](https://python-poetry.org/).

## Overview
### Models
[cloud_event_model](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/cloud_event_model) is a widely used model for validating `Pub/Sub` messages. It is commonly used as a superclass and contains functions for converting the model to valid JSON strings.

Some general [Pydantic](https://pydantic-docs.helpmanual.io/) models that are generated from public APIs with the help from [datamodel-code-generator](https://pypi.org/project/datamodel-code-generator/):
* [freg_models](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/freg_models)
* [krr_models](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/krr_models)

The [phone_validator_models](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/phone_validator_models) helper provides models for validating phone numbers.

### ps_message
These packages are used by modules to makes sure the data is valid when passing information between them as `Pub/Sub` messages. They inherit their models from [cloud_event_model](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/cloud_event_model).

### retry_helper
This helper is supposed to wrap a `Cloud Function` inside a configurable retry method. This is created with best practices from Google in mind.

### otel_setup
OpenTelemetry is a collection of tools, APIs, and SDKs. It allows one to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help you analyze your software’s performance and behavior. It collects all flask and requests calls.

The [otel_setup](https://github.com/knowit/Innbyggerkontakt-public/tree/master/helpers/otel_setup) helper simplifies the tracing setup when using the standard `Cloud Functions` [flask](https://flask.palletsprojects.com/en/2.2.x/) setup (which is the standard).

## How to
### Install
```bash
pip install %package_name%
    --extra-index-url https://europe-west3-python.pkg.dev/innbyggerkontakt-dev/ik-python-repo/simple
```
or locally when in package:
```bash
poetry install
```

> PS! For production environment, use this as the extra index url: --extra-index-url https://europe-west3-python.pkg.dev/innbyggerkontakt/ik-python-repo/simple.


It is necessary to authenticate:
```bash
pip install keyrings.google-artifactregistry-auth
gcloud auth login
```
It will try to find the default credentials.

To see an example with the use of [Poetry](https://python-poetry.org/), check out [freg_batch_getter](https://github.com/knowit/Innbyggerkontakt-public/tree/master/freg_batch_getter).

### Publish
This section will guide you to publish your own package to this projects [Artifact Registry](https://cloud.google.com/artifact-registry) with the help of [Poetry](https://python-poetry.org/):

```bash
# Install Poetry with pipx
pipx install poetry

# Add authentication to Poetry
poetry self add keyrings.google-artifactregistry-auth

# (If necessary)
gcloud auth login

# Update version-number
poetry version [patch | minor | major] # Or manually edit pyproject.toml file

# To publish
poetry publish -r py-innbyggerkontakt-dev-artifact # This happens automatically in CI on merge to master.
poetry publish -r py-innbyggerkontakt-artifact
```

This should publish your package to the artifact registry.
