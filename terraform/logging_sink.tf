resource "google_logging_project_sink" "slack-sink" {
  name = "pubsub-errors-slack-sink"

  destination            = "pubsub.googleapis.com/${google_pubsub_topic.logs.id}"
  filter                 = "resource.type=(cloud_function OR cloud_run_revision) AND severity >= ERROR"
  unique_writer_identity = true
}
