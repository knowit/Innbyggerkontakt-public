resource "random_id" "cloud_task_deploy_id" {
  byte_length = 8
}

resource "google_cloud_tasks_queue" "recipients_feed" {
  name     = "recipients-feed-${random_id.cloud_task_deploy_id.hex}"
  location = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]

  retry_config {
    max_attempts = 1
  }

  stackdriver_logging_config {
    sampling_ratio = 1
  }
}

resource "google_cloud_tasks_queue" "mailjet" {
  name     = "mailjet-${random_id.cloud_task_deploy_id.hex}"
  location = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]

  rate_limits {
    max_concurrent_dispatches = 5
    max_dispatches_per_second = 60
  }

  retry_config {
    //max_attempts = 5
    max_retry_duration = "60s"
    max_backoff        = "60s"
    min_backoff        = "2s"
    //max_doublings = 1
  }

  stackdriver_logging_config {
    sampling_ratio = 1.0
  }
}

resource "google_cloud_tasks_queue" "message" {
  name     = "message-${random_id.cloud_task_deploy_id.hex}"
  location = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]

  rate_limits {
    max_concurrent_dispatches = 1
    max_dispatches_per_second = 120
  }
}

resource "google_cloud_tasks_queue" "schedule_bulletin" {
  name     = "schedule-bulletin-${random_id.cloud_task_deploy_id.hex}"
  location = yamldecode(file("../config/environments.yml"))[var.project_id]["app_engine_region"]
}
