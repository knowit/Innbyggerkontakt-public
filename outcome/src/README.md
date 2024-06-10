# Outcome

[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)
[![](https://img.shields.io/badge/FastAPI-a?style=flat&logo=fastapi&label=Library&color=009688&logoColor=ffffff)](https://fastapi.tiangolo.com/)

[![](https://img.shields.io/badge/Docker-a?style=flat&logo=docker&label=Container&color=2496ED&logoColor=ffffff)](https://www.docker.com/)
[![](https://img.shields.io/badge/PostgreSQL-a?style=flat&logo=postgresql&label=Database&color=4169E1&logoColor=ffffff)](https://www.postgresql.org/)

Outcome contains both Outcome-api and Outcome-pubsub-listener. The purpose of the Outcome module is to keep track of results from messages. E.g. result of queries and how many emails where sent. For now, this module does not include statistics from SMS messages.

## API

This is an API created with [fastAPI](https://fastapi.tiangolo.com/) and is started through `api_main.py`. This API serves statistics from database and Mailjet.

## Pub/Sub-listener

Triggered by every message to the Outcome PubSub topic, and stores data in a database.

## Setup

To run this locally you need to set environment-variables and set up a local [PostgreSQL](https://www.postgresql.org/) database in Docker.

```bash
# set environment variables
DB_PASS="supersecretpassword"
DB_PORT="5433"
DB_CONNECTION_NAME="localhost"

# Create postgresql instance in docker
docker create --name outcome -e POSTGRES_PASSWORD=$DB_PASS -p $DB_PORT:5432 postgres

# Setup alembic for schema migration
pip install -r requirements_test.txt
# Install outcome in editable mode for alembic to access models
pip install -e .

# Run alembic migration (62ce27586767)
alembic upgrade LAST_REVISION
```

## Schema migration

Alembic is used for Postgres schema migration.

```bash
# Auto generate new revision from `models/db/db_models.py`
alembic revision --autogenerate --head=LAST_REVISION -m "REVISION_NAME"
# Result can be found under migrations/versions/LAST_REVISION_REVISION_NAME.py
# Verify and update the generated file.
```

Alembic migration is executed every time an outcome/pubsub_listener `Cloud Function` is "created/generated".

> PS: If both API and pubsub_listener is updated in the same PR, Outcome API might raise errors until pubsub_listener is done with migration.
