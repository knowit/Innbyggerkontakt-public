provider "google" {
  project = var.project_id
  region  = "europe-west3"
}

resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
}

resource "google_project_service" "container_registry" {
  service = "containerregistry.googleapis.com"

  disable_dependent_services = true
}

resource "google_project_service" "secret_manager" {
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "cloud_sql" {
  service = "sqladmin.googleapis.com"
}

resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
}

resource "google_project_service" "cloud_build" {
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "cloud_tasks" {
  service = "cloudtasks.googleapis.com"
}

resource "google_project_service" "cloud_scheduler" {
  service = "cloudscheduler.googleapis.com"
}

resource "google_project_service" "compute" {
  service = "compute.googleapis.com"
}

resource "google_project_service" "servicenetworking" {
  service = "servicenetworking.googleapis.com"
}

resource "google_project_service" "vpc_access" {
  service = "vpcaccess.googleapis.com"
}
