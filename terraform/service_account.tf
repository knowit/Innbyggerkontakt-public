resource "google_service_account" "recipients" {
  account_id   = "recipients-cloud-run"
  description  = "Service account for recipients module"
  display_name = "recipients-cloud-run"
  project      = var.project_id
}

resource "google_service_account" "outcome" {
  account_id   = "outcome-cloud-run"
  description  = "Service account for outcome-api module"
  display_name = "outcome-api-cloud-run"
  project      = var.project_id
}

resource "google_service_account" "firestore_active_search" {
  account_id   = "firestore-active-search"
  display_name = "firestore-active-search"
  project      = var.project_id
}

resource "google_service_account" "firestore_draft_mml" {
  account_id   = "firestore-draft-mml"
  display_name = "firestore-draft-mml"
  project      = var.project_id
}

resource "google_service_account" "mml_pubsub_listener" {
  account_id   = "mml-pubsub-listener"
  display_name = "mml-pubsub-listener"
  project      = var.project_id
}

resource "google_service_account" "firestore_active_search_deleted" {
  account_id   = "firestore-active-search-delete"
  display_name = "firestore-active-search-deleted"
  project      = var.project_id
}

resource "google_service_account" "firestore_active_event" {
  account_id   = "firestore-active-event"
  display_name = "firestore-active-event"
  project      = var.project_id
}

resource "google_service_account" "firestore_active_event_deleted" {
  account_id   = "firestore-active-event-delete"
  display_name = "firestore-trigger-event-deleted"
  project      = var.project_id
}

resource "google_service_account" "message_trigger" {
  account_id   = "message-trigger"
  display_name = "message-trigger"
  project      = var.project_id
}

resource "google_service_account" "event_trigger" {
  account_id   = "event-trigger"
  display_name = "event-trigger"
  project      = var.project_id
}

resource "google_service_account" "outcome_pubsub_listener" {
  account_id   = "outcome-pubsub-listener"
  display_name = "outcome-pubsub-listener"
  project      = var.project_id
}

resource "google_service_account" "message" {
  account_id   = "message"
  display_name = "message"
  project      = var.project_id
}

resource "google_service_account" "cloudrun_admin" {
  account_id   = "cloudrun-admin"
  display_name = "cloudrun-admin"
  project      = var.project_id
}


resource "google_service_account" "import_postal_codes" {
  account_id   = "import-postal-codes"
  display_name = "import-postal-codes"
  project      = var.project_id
}


resource "google_service_account" "send_test" {
  account_id   = "send-test"
  display_name = "sent-test"
  project      = var.project_id
}


resource "google_service_account" "firestore_styles" {
  account_id   = "firestore-styles"
  display_name = "firestore-styles"
  project      = var.project_id
}


resource "google_service_account" "send_mail_proxy" {
  account_id   = "send-mail-proxy"
  display_name = "send-mail-proxy"
  project      = var.project_id
}


resource "google_service_account" "message_status" {
  account_id   = "message-status"
  display_name = "message-status"
  project      = var.project_id
}


resource "google_service_account" "recipients_presearch" {
  account_id   = "recipients-presearch"
  display_name = "recipients-presearch"
  project      = var.project_id
}

resource "google_service_account" "mail_template_content" {
  account_id   = "mail-template-content"
  display_name = "mail-template-content"
  project      = var.project_id
}

resource "google_service_account" "delete_mml_outdated" {
  account_id   = "delete-mml-outdated"
  display_name = "delete-mml-outdated"
  project      = var.project_id
}
