resource "google_cloudbuild_trigger" "packages_source_pr_python_test" {
  provider = google-beta
  name     = "Packages-source-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
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
    _DIR       = "packages_source/python/"
    _PIP_QUIET = "true"
  }
}
