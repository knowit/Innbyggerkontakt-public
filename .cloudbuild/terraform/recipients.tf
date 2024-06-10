resource "google_cloudbuild_trigger" "recipients_pr_python_test" {
  provider = google-beta
  name     = "Recipients-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "recipients/**",
    "packages_source/python/**"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    pull_request {
      branch          = ".*"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }
  substitutions = {
    _DIR       = "recipients/"
    _PIP_QUIET = "true"
  }
}

resource "google_cloudbuild_trigger" "recipients_deploy" {
  provider = google-beta
  name     = "Recipients-build-and-deploy"
  filename = ".cloudbuild/deploy_cloudrun.yml"
  included_files = [
    "recipients/**"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR          = "recipients/"
    _SERVICE_NAME = "recipients"
    _LOCATION     = "europe-west3"
  }
}
