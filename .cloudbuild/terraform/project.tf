provider "google" {
  project = var.project_id
  region  = "europe-west"
}

provider "google-beta" {
  project = var.project_id
  region  = "europe-west"
}
