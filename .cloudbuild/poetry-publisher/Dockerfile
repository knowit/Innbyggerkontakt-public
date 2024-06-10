from python:3.10 AS base
ARG YOUR_ENV

ENV YOUR_ENV=${YOUR_ENV} \
  PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=1.2.2 \
  PATH="/root/.local/bin:/builder/home/.local/bin:$HOME/.poetry/bin:$PATH"

RUN curl -sSL https://install.python-poetry.org | python3 -

ENTRYPOINT ["poetry"]
