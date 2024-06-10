resource "google_artifact_registry_repository" "ik-python-repo" {
  location      = "europe-west3"
  repository_id = "ik-python-repo"
  description   = "A Python repo"
  format        = "python"
}
