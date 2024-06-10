resource "google_cloudbuild_trigger" "message_python_test" {
  provider = google-beta
  name     = "Message-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "message/message/**",
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
    _DIR       = "message/message/"
    _PIP_QUIET = "true"
  }
}

resource "google_cloudbuild_trigger" "proxy_python_test" {
  provider = google-beta
  name     = "Proxy-pr-python-test"
  filename = ".cloudbuild/python_test.yml"
  included_files = [
    "message/proxy/**",
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
    _DIR = "message/proxy/"
  }
}
