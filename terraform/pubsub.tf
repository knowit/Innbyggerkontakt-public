resource "google_pubsub_topic" "recipients_status" {
  name = "recipients_status"
}

resource "google_pubsub_topic" "freg_events" {
  name = "freg_events"
}

resource "google_pubsub_topic" "outcome" {
  name = "outcome"
}

resource "google_pubsub_topic" "logs" {
  name = "logs"
}

resource "google_pubsub_topic" "message_status" {
  name = "message_status"
}

resource "google_pubsub_topic" "delete_mml_outdated" {
  name = "delete_mml_outdated"
}
