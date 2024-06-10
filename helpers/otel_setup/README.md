# Otel setup

## How to build
* [Install poetry](https://python-poetry.org/docs/#installation)
* Build with `poetry build`
## How to publish
* [Set up authentication with Google](https://cloud.google.com/artifact-registry/docs/python/authentication)
* either `poerty publish -r google` or with twine `twine upload --repository-urltwine upload --repository-url <google-artifact-url>`

## How to install
Put `--extra-index-url https://europe-west3-python.pkg.dev/innbyggerkontakt-dev/ik-python-repo/simple/` on the top of your `requirements.txt` file.
