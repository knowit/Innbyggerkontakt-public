resource "google_cloudbuild_trigger" "release_deployment_image" {
  provider = google
  name     = "Release-deployment-image"
  filename = ".cloudbuild/publish_image.yml"
  included_files = [
    ".cloudbuild/Dockerfile",
    ".cloudbuild/terraform/vars.tf"
  ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR               = ".cloudbuild/"
    _SERVICE_NAME      = "deployment"
    _TERRAFORM_VERSION = var.terraform.next_version
  }
}

resource "google_cloudbuild_trigger" "build_deployment_image" {
  provider = google
  name     = "Build-deployment-image"
  filename = ".cloudbuild/build_image.yml"
  included_files = [
    ".cloudbuild/Dockerfile",
    ".cloudbuild/terraform/vars.tf"
  ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    pull_request {
      branch          = ".*"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }
  substitutions = {
    _DIR               = ".cloudbuild/"
    _SERVICE_NAME      = "deployment"
    _TERRAFORM_VERSION = var.terraform.next_version
  }
}
