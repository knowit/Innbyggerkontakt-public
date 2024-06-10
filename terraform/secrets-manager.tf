resource "google_secret_manager_secret" "postgres-password" {
  secret_id = "OUTCOME_POSTGRES_PASSWORD"

  labels = {
    service = "outcome"
  }

  replication {
    automatic = true
  }
}


resource "google_secret_manager_secret_version" "postgres-password-secret" {
  secret = google_secret_manager_secret.postgres-password.id

  secret_data = google_sql_user.outcome_postgres_users.password
}
