# Packages Source
[![](https://img.shields.io/badge/Docker-a?style=flat&logo=docker&label=Container&color=2496ED&logoColor=ffffff)](https://www.docker.com/)
[![](https://img.shields.io/badge/Poetry-a?style=flat&logo=poetry&label=Package-Manager&color=60A5FA&logoColor=ffffff)](https://python-poetry.org/)
[![](https://img.shields.io/badge/Python-a?style=flat&logo=python&label=Code&color=3776AB&logoColor=ffffff)](https://www.python.org/)

This is a util package with common modules that can be shared between resources.

>PS: `Cloud Functions` does not install this package again if nothing has changed in the requirements.txt file from last deployment.
To force `Cloud Function` to reinstall this package you need to change the comment in that cloud functions `requirements.txt` file.
[Hooks](https://github.com/knowit/Innbyggerkontakt-public/tree/master/hooks) includes a git pre-commit-hook that updates all requirement files automatically when this package is changed.

>PS: Note that using some of these packages may restrict Python versions. Updating them or creating new ones should be considered. The utilities may be helpful for learning other libraries and how to set them up, but maybe not as helpful for experienced developers. Some are also wrappers around well documented libraries, thus may not be beneficial in all cases.

## Content
The next section will have a short description of what each package contains.
### Common
Common nice-to-have code snippets.

### Digdir
A [Digdir](https://www.digdir.no/) client to authenticate and make authorized requests to [Fiks folkeregsiter](https://www.ks.no/fagomrader/digitalisering/felleslosninger/modernisert-folkeregister/) and [KRR](https://eid.difi.no/nb/personvernerklaering/kontakt-og-reservasjonsregisteret-krr) (Kontakt- og reservasjonsregisteret).

### Firebase
A `Firebase` client to access `Firestore` and to authenticate Firebase users.

#### Environment variables used
```yml
GCLOUD_PROJECT = "innbyggerkontakt-dev"
```

### GCP
A client wrapper around [GCP](https://cloud.google.com/) (Google Cloud Platform) library.

### Monitoring
A monitoring client to add traces and logs to GCP.

#### Environment variables used:
```yml
GCLOU_PROJECT = "innbyggerkontakt-dev"
FUNCTION_NAME or K_SERVICE = "NAME"
FUNCTION_REGION or GCLOUD_REGION = "europe-westX"
# FUNCTION_NAME and FUNCTION_REGION is default for cloud_functions and
# K_SERVICE and GCLOUD_REGION is default for cloud_runs
```

#### To publish this package to artifact registry
Do the following:

1. Install Poetry, preferably with pipx: [instructions](https://python-poetry.org/docs/).
    ```bash
    pipx install poetry
    ```
2. Run, [ref](https://cloud.google.com/artifact-registry/docs/python/authentication):
    ```bash
    poetry self add keyrings.google-artifactregistry-auth
    ```
3. Make sure you are logged into the correct project with [gcloud CLI](https://cloud.google.com/sdk/gcloud), to login:
    ```bash
    gcloud auth login
    ```
4. Run:
    ```bash
    poetry publish -r py-innbyggerkontakt-dev-artifact
    ```

### ⚠️Warning⚠️
packages-source is also installed on older Cloud Functions v1 directly from source. It is recommended to instead install with `pip` from artifact registry when going to Cloud Functions v2.
