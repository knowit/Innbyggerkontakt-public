resource "google_project_iam_member" "secret_Accessors" {
  for_each = toset([
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.outcome.email}",
    "serviceAccount:${google_service_account.outcome_pubsub_listener.email}",
    "serviceAccount:${google_service_account.message.email}",
    "serviceAccount:${google_service_account.firestore_styles.email}",
    "serviceAccount:${google_service_account.mail_template_content.email}"
  ])
  role    = "roles/secretmanager.secretAccessor"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloudsql_client" {
  for_each = toset([
    "serviceAccount:${google_service_account.outcome.email}",
    "serviceAccount:${google_service_account.outcome_pubsub_listener.email}"
  ])
  role    = "roles/cloudsql.client"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "pubsub_publisher" {
  for_each = toset([
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.message.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    google_logging_project_sink.slack-sink.writer_identity,
  ])
  role    = "roles/pubsub.publisher"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloud_task_enqueuer" {
  for_each = toset([
    "serviceAccount:${google_service_account.message.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.send_mail_proxy.email}"
  ])
  role    = "roles/cloudtasks.enqueuer"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloud_tasks_deleter" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_search_deleted.email}"
  ])
  role    = "roles/cloudtasks.taskDeleter"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "storage_object_admin" {
  for_each = toset([
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.message.email}"
  ])
  role    = "roles/storage.objectAdmin"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "storage_object_viewer" {
  for_each = toset([
    "serviceAccount:${google_service_account.message_trigger.email}",
  ])
  role    = "roles/storage.objectViewer"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "datastore_viewer" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.outcome.email}",
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.cloudrun_admin.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.recipients_presearch.email}",
    "serviceAccount:${google_service_account.mail_template_content.email}"
  ])
  role    = "roles/datastore.viewer"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "datastore_user" {
  for_each = toset([
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.cloudrun_admin.email}",
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.firestore_draft_mml.email}",
    "serviceAccount:${google_service_account.import_postal_codes.email}",
    "serviceAccount:${google_service_account.firestore_styles.email}",
    "serviceAccount:${google_service_account.message_status.email}",
    "serviceAccount:${google_service_account.mml_pubsub_listener.email}",
  ])
  role    = "roles/datastore.user"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "run_invoker" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_draft_mml.email}",
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.recipients_presearch.email}"
  ])
  role    = "roles/run.invoker"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "service_account_user" {
  for_each = toset([
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.message.email}",
    "serviceAccount:${google_service_account.send_mail_proxy.email}"
  ])
  role    = "roles/iam.serviceAccountUser"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloud_functions_invoker" {
  for_each = toset([
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.message.email}"
  ])
  role    = "roles/cloudfunctions.invoker"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloud_scheduler_admin" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.firestore_active_event_deleted.email}"
  ])
  role    = "roles/cloudscheduler.admin"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "firebaseauth_viewer" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.recipients_presearch.email}",
  ])
  role    = "roles/firebaseauth.viewer"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "firebaseauth_admin" {
  for_each = toset([
    "serviceAccount:${google_service_account.outcome.email}",
    "serviceAccount:${google_service_account.cloudrun_admin.email}",
    "serviceAccount:${google_service_account.send_test.email}"
  ])
  role    = "roles/firebaseauth.admin"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "logging_logWriter" {
  for_each = toset([
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_active_search_deleted.email}",
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.firestore_active_event_deleted.email}",
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.outcome_pubsub_listener.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.message.email}",
    "serviceAccount:${google_service_account.mml_pubsub_listener.email}"
  ])
  role    = "roles/logging.logWriter"
  member  = each.key
  project = var.project_id
}

resource "google_project_iam_member" "cloudtrace_agent" {
  for_each = toset([
    "serviceAccount:${google_service_account.delete_mml_outdated.email}",
    "serviceAccount:${google_service_account.event_trigger.email}",
    "serviceAccount:${google_service_account.firestore_active_event.email}",
    "serviceAccount:${google_service_account.firestore_active_event_deleted.email}",
    "serviceAccount:${google_service_account.firestore_active_search.email}",
    "serviceAccount:${google_service_account.firestore_active_search_deleted.email}",
    "serviceAccount:${google_service_account.firestore_draft_mml.email}",
    "serviceAccount:${google_service_account.import_postal_codes.email}",
    "serviceAccount:${google_service_account.message_status.email}",
    "serviceAccount:${google_service_account.outcome_pubsub_listener.email}",
    "serviceAccount:${google_service_account.recipients_presearch.email}",
    "serviceAccount:${google_service_account.send_mail_proxy.email}",
    "serviceAccount:${google_service_account.mml_pubsub_listener.email}",
    "serviceAccount:${google_service_account.message_trigger.email}",
    "serviceAccount:${google_service_account.send_test.email}",
    "serviceAccount:${google_service_account.recipients.email}",
    "serviceAccount:${google_service_account.message.email}"
  ])
  role    = "roles/cloudtrace.agent"
  member  = each.key
  project = var.project_id
}
