resource "google_cloudbuild_trigger" "outcome_pr_python_test" {
  provider = google-beta
  name     = "Outcome-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "outcome/**",
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
    _DIR       = "outcome/src/"
    _PIP_QUIET = "true"
  }
}

resource "google_cloudbuild_trigger" "outcome_api_deploy" {
  provider = google-beta
  name     = "Outcome-build-and-deploy"
  filename = ".cloudbuild/deploy_cloudrun.yml"
  included_files = [
    "outcome/src/api/**",
    "outcome/src/models/**",
    "outcome/src/api_main.py",
    "outcome/src/database.py",
    "outcome/src/Dockerfile",
    "outcome/src/requrements_api.txt"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR          = "outcome/src/"
    _SERVICE_NAME = "outcome"
    _LOCATION     = "europe-west3"
  }
}
