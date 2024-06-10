# To automate all potry-packaged helpers

resource "google_cloudbuild_trigger" "poetry_helpers_test" { # For when a poetry package needs testing
  provider = google-beta
  for_each = toset([for p in fileset("${path.root}/../../helpers/", "*/pyproject.toml") : dirname(p)]) #->["freg_models", "otel_setup",..]
  included_files = [
    "helpers/${each.key}/**",
  ]
  name        = replace("${each.key}-poetry-tester", "_", "-")
  filename    = ".cloudbuild/poetry_test.yml"
  description = "Tests ${each.key} with poetry."
  ignored_files = [
    "helpers/${each.key}/pyproject.toml",
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
    _DIR     = "helpers/${each.key}"
  }
}

resource "google_cloudbuild_trigger" "poetry_helpers_publish" { # When editing the pyproject.toml file it is assumed you are upgrading it's version and needs a new publish
  provider    = google-beta
  for_each    = toset([for p in fileset("${path.root}/../../helpers/", "*/pyproject.toml") : dirname(p)]) #->["freg_models", "otel_setup",..]
  name        = replace("${each.key}-poetry-publish", "_", "-")
  filename    = ".cloudbuild/poetry_publish.yml"
  description = "Publish with poetry. NB: Will fail if not updated the semver version."
  included_files = [
    "helpers/${each.key}/pyproject.toml",
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _PACKAGE = each.key
    _DIR     = "helpers/${each.key}"
  }
}
