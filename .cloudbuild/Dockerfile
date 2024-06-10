ARG UBUNTU_VERSION=20.04
FROM ubuntu:${UBUNTU_VERSION}

# Disable Prompt During Packages Installation
ARG DEBIAN_FRONTEND=noninteractive
ARG TERRAFORM_VERSION=1.0.4

RUN apt update \
    && apt install -y software-properties-common curl \
    && curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add - \
    && apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
    && apt update \
    && apt install -y python3 python3-pip terraform=${TERRAFORM_VERSION}

RUN pip3 --version \
    && python3 --version \
    && terraform --version
