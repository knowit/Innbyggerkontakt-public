resource "google_storage_bucket" "cloud_functions_source_code_bucket" {
  name     = "${var.project_id}-cloud-functions"
  location = "europe-west3"
}

resource "google_storage_bucket" "main_bucket" {
  name     = var.project_id
  location = "europe-west3"

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 30
    }
  }

  versioning {
    enabled = true
  }

}

resource "google_storage_bucket" "yarn_cache" {
  name     = "${var.project_id}-yarn-cache"
  location = "europe-west3"

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 7
    }
  }
}
