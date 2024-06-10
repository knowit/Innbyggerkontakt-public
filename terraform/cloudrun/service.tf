locals {
  default_environment_variables = [
    {
      name  = "GCLOUD_PROJECT"
      value = var.project
    }
  ]
}

resource "google_cloud_run_service" "service" {
  name     = var.name
  location = var.location

  template {
    spec {
      containers {
        image = var.image

        dynamic "env" {
          for_each = concat(local.default_environment_variables, var.environment_variables)
          content {
            name  = env.value.name
            value = env.value.value
          }
        }
      }
      service_account_name = var.service_account_name
      timeout_seconds      = var.timeout_seconds
    }

    metadata {
      annotations = var.annotations
    }
  }

  autogenerate_revision_name = true
  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image
    ]
  }
}
