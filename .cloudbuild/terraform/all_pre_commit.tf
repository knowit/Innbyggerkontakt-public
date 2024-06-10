resource "google_cloudbuild_trigger" "all_pre_commit" {
  provider    = google-beta
  name        = "all-pr-pre-commit"
  filename    = ".cloudbuild/pre-commit.yml"
  description = "Will trigger a pre-commit flakeheaven --all-files for all pushed code. (Only new code will be validated)"
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    pull_request {
      branch          = ".*"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }
}
