resource "google_cloud_scheduler_job" "job" {
  name             = "freg-event-feed"
  description      = "Run freg events batch job"
  region           = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
  schedule         = "0 9,13 * * *"
  time_zone        = "Europe/Oslo"
  attempt_deadline = "1200s"

  http_target {
    http_method = "GET"
    uri         = "${module.cloud_run_recipients.url}/freg/event-feed/start"

    oidc_token {
      service_account_email = google_service_account.recipients.email
    }
  }
}

resource "google_cloud_scheduler_job" "delete_mml_outdated" {
  name        = "delete-mml-outdated"
  description = "Delete all mml-filters in {bulletin_id}['recipients']['manual'] where the timestamp is outdated by at least 30 days"
  region      = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
  schedule    = "0 6,18 * * *"
  time_zone   = "Europe/Oslo"

  pubsub_target {
    topic_name = google_pubsub_topic.delete_mml_outdated.id
    data       = base64encode("start")
  }
}

resource "google_cloud_scheduler_job" "matrikkel_download_data" {
  name        = "matrikkel-download-data"
  description = "Download matrikkel data for every municipality in firestore."
  region      = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
  schedule    = "0 7 * * *"
  time_zone   = "Europe/Oslo"

  pubsub_target {
    # topic.id is the topic's full resource name.
    topic_name = google_pubsub_topic.function2_map["matrikkel_cron_job_download_data"].id
    data       = base64encode("start")
  }
}

resource "google_cloud_scheduler_job" "delete_mailjet_contacts" {
  name        = "delete-mailjet-contacts"
  description = "Delete contacts at least once a day."
  region      = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
  schedule    = "0 */4 * * *"
  count       = var.project_id == "innbyggerkontakt" ? 1 : 0 # Should only run in prod.
  pubsub_target {
    topic_name = google_pubsub_topic.function2_map["delete_mailjet_contacts"].id
    data       = base64encode("DELETE_ALL_CONTACTS")
  }
}
