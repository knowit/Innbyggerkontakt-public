# Setup
`pip install -r requirements_test.txt`

# --- Manual deploy ---
    # Assuming dev environment is used, and docker is configured
    # https://cloud.google.com/sdk/gcloud/reference/auth/configure-docker

    # Build innbyggerkontakt image
    cd ../../../packages_source
    docker build . -t innbyggerkontakt

    # Build image
    docker build . -t gcr.io/innbyggerkontakt-dev/admin

    # Push image
    docker push gcr.io/innbyggerkontakt-dev/admin

    # Configure cloud run in gcp console
