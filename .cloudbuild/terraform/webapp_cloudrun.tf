resource "google_cloudbuild_trigger" "webapp_admin_pr_python_test" {
  provider = google-beta
  name     = "Webapp-admin-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "webapp/cloudrun/admin/**",
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
    _DIR = "webapp/cloudrun/admin/"
  }
}

resource "google_cloudbuild_trigger" "admin_deploy" {
  provider = google-beta
  name     = "Admin-build-and-deploy"
  filename = ".cloudbuild/deploy_cloudrun.yml"
  included_files = [
    "webapp/cloudrun/admin/**"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR          = "webapp/cloudrun/admin/"
    _SERVICE_NAME = "admin"
    _LOCATION     = "europe-west3"
  }
}
