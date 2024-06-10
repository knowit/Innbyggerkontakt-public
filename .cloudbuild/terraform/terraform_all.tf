resource "google_cloudbuild_trigger" "terraform_apply" {
  provider = google-beta
  name     = "Terraform-apply"
  filename = ".cloudbuild/terraform_apply.yml"
  included_files = [
    "outcome/src/**",
    "webapp/functions/**",
    "message/**",
    "terraform/**",
    "helpers/**",
    "freg_batch_getter/**",
    "freg_fetch_jobbid/**",
    "get_phone_numbers/**",
    "sms_sender/**",
    "matrikkel/**"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR               = "terraform/"
    _TERRAFORM_VERSION = var.terraform.current_version
  }
}


resource "google_cloudbuild_trigger" "terraform_apply_cloudbuild" {
  provider = google-beta
  name     = "Terraform-apply-cloudbuild"
  filename = ".cloudbuild/terraform_apply.yml"
  included_files = [
    ".cloudbuild/**"
  ]
  github {
    owner = "knowit"
    name  = "Innbyggerkontakt"
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR               = ".cloudbuild/terraform/"
    _TERRAFORM_VERSION = var.terraform.current_version
  }
}
