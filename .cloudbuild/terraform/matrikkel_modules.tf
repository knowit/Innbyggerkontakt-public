resource "google_cloudbuild_trigger" "matrikkel_modules_poetry_tests" {
  for_each = toset(["download_matrikkel_data_batch", "download_matrikkel_data_job"])

  name        = replace("${each.key}-poetry-tester", "_", "-")
  description = "Tests ${each.key} with poetry."

  provider = google-beta
  filename = ".cloudbuild/poetry_test.yml"

  included_files = [
    "matrikkel/${each.key}/**",
  ]
  ignored_files = [
    "matrikkel/${each.key}/pyproject.toml",
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
    _PACKAGE = "${each.key}"
    _DIR     = "matrikkel/${each.key}"
  }
}
