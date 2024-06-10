resource "google_cloudbuild_trigger" "webapp_functions_pr_python_test" {
  provider = google-beta
  name     = "Webapp-functions-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "webapp/functions/python/**",
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
    _DIR = "webapp/functions/python/"
  }
}
