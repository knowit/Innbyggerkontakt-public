FROM python:3-slim as builder
# WORKDIR /app
# ARG DEBIAN_FRONTEND=noninteractive
#  ARG DEBCONF_NOWARNINGS="yes"

#  Setting env varialables and creating venv
ENV PYTHONUNBUFFERED 1
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt .
RUN pip install -r requirements.txt

# RUN pip install -r requirements.txt
#  CMD python --version

FROM python:3-slim
RUN apt-get -y update \
    && apt-get -y install git --no-install-recommends \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
# Copying the whole venv folder.
COPY --from=builder /opt/venv /opt/venv
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ENV FLAKEHEAVEN_CACHE_TIMEOUT=0

# COPY sms app
# WORKDIR /app
RUN . /opt/venv/bin/activate
ENTRYPOINT ["pre-commit"]
#  CMD ["run", "--all-files"]
