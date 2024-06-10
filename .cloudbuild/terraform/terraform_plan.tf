resource "google_cloudbuild_trigger" "terraform_plan" {
  provider = google-beta
  name     = "Terraform-plan"
  filename = ".cloudbuild/terraform_plan.yml"
  included_files = [
    "terraform/**",
    "config/**"
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
    _DIR               = "terraform/"
    _TERRAFORM_VERSION = var.terraform.current_version
  }
}

resource "google_cloudbuild_trigger" "terraform_plan_cloudbuild" {
  provider = google-beta
  name     = "Terraform-plan-cloudbuild"
  filename = ".cloudbuild/terraform_plan.yml"
  included_files = [
    ".cloudbuild/terraform/**"
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
    _DIR               = ".cloudbuild/terraform/"
    _TERRAFORM_VERSION = var.terraform.current_version
  }
}
