resource "google_cloudbuild_trigger" "sms_modules_poetry_tests" {
  for_each = toset(["freg_batch_getter", "freg_fetch_jobbid", "get_phone_number_from_krr"])

  name        = replace("${each.key}-poetry-tester", "_", "-")
  description = "Tests ${each.key} with poetry."

  provider = google-beta
  filename = ".cloudbuild/poetry_test.yml"

  included_files = [
    "${each.key}/**",
  ]
  ignored_files = [
    "${each.key}/pyproject.toml",
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
    _DIR     = "${each.key}"
  }
}
