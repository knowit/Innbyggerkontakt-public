module "cloud_run_recipients" {
  source = "./cloudrun"

  project  = var.project_id
  location = "europe-west3"
  image    = "gcr.io/${var.project_id}/recipients:latest"

  name                 = "recipients"
  protocol             = "http"
  auth                 = true
  service_account_name = google_service_account.recipients.email

  timeout_seconds = 1500

  environment_variables = [
    {
      name  = "RECIPIENTS_STATUS_TOPIC"
      value = google_pubsub_topic.recipients_status.name
    },
    {
      name  = "FREG_EVENT_TOPIC"
      value = google_pubsub_topic.freg_events.name
    },
    {
      name  = "OUTCOME_TOPIC"
      value = google_pubsub_topic.outcome.name
    },
    {
      name  = "FIKS_ENDPOINT"
      value = yamldecode(file("../config/environments.yml"))[var.project_id]["fiks_endpoint"]
    },
    {
      name  = "MASKINPORTEN_URL"
      value = yamldecode(file("../config/environments.yml"))[var.project_id]["maskinporten_endpoint"]
    },
    {
      name  = "MATRIKKEL_ENDPOINT"
      value = yamldecode(file("../config/environments.yml"))[var.project_id]["matrikkel_endpoint"]
    },
    {
      name  = "APP_ENGINE_REGION"
      value = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
    },
    {
      name  = "ORGANIZATION"
      value = yamldecode(file("../config/environments.yml"))[var.project_id]["fiks_freg_event_organization"]
    },
    {
      name  = "GCLOUD_REGION"
      value = "europe-west3"
    }
  ]

  annotations = {
    "autoscaling.knative.dev/maxScale" = "100"
  }
}

module "cloud_run_outcome" {
  source = "./cloudrun"

  project  = var.project_id
  location = "europe-west1"
  image    = "gcr.io/${var.project_id}/outcome:latest"

  name                 = "outcome"
  protocol             = "http"
  auth                 = false
  service_account_name = google_service_account.outcome.email
  depends_on           = [google_secret_manager_secret_version.postgres-password-secret]

  environment_variables = [
    {
      name  = "DB_CONNECTION_NAME"
      value = google_sql_database_instance.outcome_database_instance.private_ip_address
    },
    {
      name  = "CORS_ALLOWED_ORIGINS"
      value = <<EOT
        []
      EOT
    }
  ]

  annotations = {
    "autoscaling.knative.dev/maxScale"        = "100"
    "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.outcome_db.name
    "run.googleapis.com/vpc-access-egress"    = "private-ranges-only"
  }
}

module "cloud_run_admin" {
  source = "./cloudrun"

  project  = var.project_id
  location = "europe-west1"
  image    = "gcr.io/${var.project_id}/admin:latest"

  name                 = "admin"
  protocol             = "http"
  auth                 = false
  service_account_name = google_service_account.cloudrun_admin.email

  environment_variables = [
    {
      name  = "SERVICE_ACCOUNT"
      value = google_service_account.cloudrun_admin.email
    },
    {
      name  = "CORS_ALLOWED_ORIGINS"
      value = <<EOT
        []
      EOT
    }
  ]

  annotations = {
    "autoscaling.knative.dev/maxScale" = "100"
  }
}

# Create public access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

# Enable public access on Cloud Run service
resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = module.cloud_run_outcome.location
  service     = module.cloud_run_outcome.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth_admin" {
  location    = module.cloud_run_admin.location
  service     = module.cloud_run_admin.name
  policy_data = data.google_iam_policy.noauth.policy_data
}
