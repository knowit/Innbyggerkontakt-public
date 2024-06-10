resource "random_id" "cloud_sql_deploy_id" {
  byte_length = 8
}

resource "google_sql_database_instance" "outcome_database_instance" {
  database_version = "POSTGRES_12"
  name             = "${var.project_id}-outcome-${random_id.cloud_sql_deploy_id.hex}"
  project          = var.project_id
  region           = "europe-west1"

  depends_on = [google_service_networking_connection.outcome_db]

  settings {
    activation_policy = "ALWAYS"
    availability_type = "ZONAL"

    backup_configuration {
      binary_log_enabled             = "false"
      enabled                        = "true"
      location                       = "eu"
      point_in_time_recovery_enabled = "true"
      start_time                     = "10:00"
    }

    disk_autoresize = "true"
    disk_size       = "10"
    disk_type       = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.outcome_db.id
    }

    location_preference {
      zone = "europe-west1-b"
    }

    maintenance_window {
      day  = "1"
      hour = "0"
    }

    pricing_plan = "PER_USE"
    tier         = "db-custom-1-3840"
  }
  deletion_protection = "false"
}

resource "google_sql_database" "outcome" {
  charset   = "UTF8"
  collation = "en_US.UTF8"
  instance  = google_sql_database_instance.outcome_database_instance.name
  name      = "outcome"
  project   = var.project_id
}


resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "google_sql_user" "outcome_postgres_users" {
  name     = "postgres"
  instance = google_sql_database_instance.outcome_database_instance.name
  password = random_password.password.result
}
