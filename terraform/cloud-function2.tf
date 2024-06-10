# Terraform for gcp cloudfunctions_v2
data "google_client_config" "current" {
}
data "google_project" "project" {
}
locals {
  region = data.google_client_config.current.region
  function_set = toset([
    "freg_fetch_jobbid",
    "freg_batch_getter",
    "get_phone_numbers_from_krr",
    "sms_sender",
    "send_test_sms",
    "matrikkel_search",
    "matrikkel_owner_search",
    "matrikkel_get_data_batch_for_organization",
    "matrikkel_cron_job_download_data",
    "delete_mailjet_contacts"
  ])

  function_paths = {
    "freg_fetch_jobbid"                         = "../freg_fetch_jobbid"
    "freg_batch_getter"                         = "../freg_batch_getter"
    "get_phone_numbers_from_krr"                = "../get_phone_numbers_from_krr"
    "sms_sender"                                = "../sms_sender"
    "send_test_sms"                             = "../send_test_sms"
    "matrikkel_search"                          = "../matrikkel/matrikkel_search"
    "matrikkel_owner_search"                    = "../matrikkel/matrikkel_owner_search"
    "matrikkel_get_data_batch_for_organization" = "../matrikkel/download_matrikkel_data_batch"
    "matrikkel_cron_job_download_data"          = "../matrikkel/download_matrikkel_data_job"
    "delete_mailjet_contacts"                   = "../delete_mailjet_contacts"
  }

  entry_points = {
    "freg_fetch_jobbid" : "handler",
    "freg_batch_getter" : "fetch_batch"
    "get_phone_numbers_from_krr" : "get_phone_numbers_from_krr",
    "sms_sender" : "send_sms",
    "send_test_sms" : "send_test_sms",
    "matrikkel_search" : "matrikkel_search",
    "matrikkel_owner_search" : "matrikkel_owner_search"
    "matrikkel_get_data_batch_for_organization" : "download_matrikkel_data_batch_for_organization",
    "matrikkel_cron_job_download_data" : "download_matrikkel_data_job",
    "delete_mailjet_contacts" : "run_auto_delete_handle"
  }

  function_memory = {
    "freg_fetch_jobbid"                         = "256M"
    "freg_batch_getter"                         = "256M"
    "get_phone_numbers_from_krr"                = "256M"
    "sms_sender"                                = "256M"
    "send_test_sms"                             = "256M"
    "matrikkel_get_data_batch_for_organization" = "4096M"
    "matrikkel_cron_job_download_data"          = "256M"
    "matrikkel_search"                          = "2048M"
    "matrikkel_owner_search"                    = "2048M"
    "delete_mailjet_contacts"                   = "256M"
  }

  service_account_roles = {
    "freg_fetch_jobbid" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/secretmanager.secretAccessor",
    ]),
    "freg_batch_getter" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectCreator"
    ]),
    "get_phone_numbers_from_krr" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectCreator",
      "roles/storage.objectViewer"
    ]),
    "sms_sender" : toset([
      "roles/editor",
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectViewer",
      "roles/datastore.user"
    ]),
    "send_test_sms" : toset([
      "roles/editor",
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor",
      "roles/datastore.user"
    ]),
    "matrikkel_get_data_batch_for_organization" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectCreator",
      "roles/storage.objectViewer"
    ]),
    "matrikkel_cron_job_download_data" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/cloudfunctions.serviceAgent"
    ]),
    "matrikkel_search" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectCreator",
      "roles/storage.objectViewer"
    ]),
    "matrikkel_owner_search" : toset([
      "roles/editor",
      "roles/pubsub.publisher",
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor",
      "roles/storage.objectCreator",
      "roles/storage.objectViewer"
    ]),
    "delete_mailjet_contacts" : toset([
      "roles/cloudfunctions.serviceAgent",
      "roles/secretmanager.secretAccessor"
    ])
  }

  service_account_role_list = flatten([
    for function in local.function_set : [
      for role in local.service_account_roles[function] : {
        "function" = function
        "role"     = role
      }
    ]
  ])
  environment_variables_map = {
    "freg_fetch_jobbid" : {
      "FIKS_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["fiks_endpoint"]
      "MASKINPORTEN_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["maskinporten_endpoint"]
      "PUBSUB_BATCH_TOPIC_ID" : google_pubsub_topic.function2_map["freg_batch_getter"].name
      "GCP_PROJECT" : var.project_id
    },
    "freg_batch_getter" : {
      "START_BATCH_TOPIC" : google_pubsub_topic.function2_map["freg_batch_getter"].name
      "START_KRR_TOPIC" : google_pubsub_topic.function2_map["get_phone_numbers_from_krr"].name
      "FIKS_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["fiks_endpoint"]
      "MASKINPORTEN_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["maskinporten_endpoint"]
      "GCP_PROJECT" : var.project_id
    },
    "get_phone_numbers_from_krr" : {
      "KRR_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["krr_endpoint"]
      "KRR_SCOPE" : yamldecode(file("../config/environments.yml"))[var.project_id]["krr_scope"]
      "MASKINPORTEN_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["maskinporten_endpoint"]
      "PROCESS_PHONE_NUMBERS_TOPIC" = google_pubsub_topic.function2_map["sms_sender"].name
      "GCP_PROJECT" : var.project_id
    },
    "sms_sender" : {
      "SINCH_REGION" : "eu"
      "SINCH_ENDPOINT" : "batches"
      "GCP_PROJECT" : var.project_id
    },
    "send_test_sms" : {
      "SINCH_REGION" : "eu"
      "SINCH_ENDPOINT" : "batches"
      "GCP_PROJECT" : var.project_id
      "CORS" : yamldecode(file("../config/environments.yml"))[var.project_id]["cors"]
    },
    "matrikkel_search" : {
      "GCP_PROJECT" : var.project_id
      "MATRIKKEL_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["matrikkel_endpoint"]
      "MATRIKKEL_OWNER_SEARCH_TOPIC" : google_pubsub_topic.function2_map["matrikkel_owner_search"].name
    },
    "matrikkel_owner_search" : {
      "GCP_PROJECT" : var.project_id
      "MATRIKKEL_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["matrikkel_endpoint"]
      "RECIPIENTS_STATUS_TOPIC" : google_pubsub_topic.recipients_status.name
      "OUTCOME_TOPIC" : google_pubsub_topic.outcome.name
      "MATRIKKEL_OWNER_SEARCH_TOPIC" : google_pubsub_topic.function2_map["matrikkel_owner_search"].name
    },
    "matrikkel_get_data_batch_for_organization" : {
      "GCP_PROJECT" : var.project_id
      "MATRIKKEL_ENDPOINT" : yamldecode(file("../config/environments.yml"))[var.project_id]["matrikkel_endpoint"]
      "DOWNLOAD_MATRIKKEL_DATA_BATCH_TOPIC" : google_pubsub_topic.function2_map["matrikkel_get_data_batch_for_organization"].name
    },
    "matrikkel_cron_job_download_data" : {
      "GCP_PROJECT" : var.project_id
      "DOWNLOAD_MATRIKKEL_DATA_BATCH_TOPIC" : google_pubsub_topic.function2_map["matrikkel_get_data_batch_for_organization"].name
    },
    "delete_mailjet_contacts" : {
      "GCP_PROJECT" : var.project_id
    }
  }
}

resource "google_storage_bucket" "function2" {
  name     = "${var.project_id}-${local.region}-function2"
  location = upper(local.region)
}
data "archive_file" "source" {
  for_each    = local.function_set
  type        = "zip"
  source_dir  = local.function_paths[each.key]
  output_path = "/tmp/${each.key}/function.zip"
}

resource "google_storage_bucket_object" "function2" {
  for_each     = data.archive_file.source
  source       = each.value.output_path
  content_type = "application/zip"
  name         = "src-${each.key}-${each.value.output_md5}.zip"
  bucket       = google_storage_bucket.function2.name
}
resource "google_pubsub_topic" "function2_map" {
  for_each = { for key, val in local.function_set : key => val if key != "send_test_sms" }
  name     = "${replace(each.key, "_", "-")}-function-topic"
}
resource "google_service_account" "function2_map" {
  for_each     = local.function_set
  account_id   = "${substr(replace(each.key, "_", "-"), 0, 16)}-function-sa"
  display_name = "${replace(each.key, "_", "-")}-function-sa"
}
resource "google_project_iam_member" "function2_roles_map" {
  count   = length(local.service_account_role_list)
  role    = local.service_account_role_list[count.index].role
  member  = "serviceAccount:${google_service_account.function2_map[local.service_account_role_list[count.index].function].email}"
  project = var.project_id
}
resource "google_cloudfunctions2_function" "general_cloud_funcs_v2" {
  for_each = { for key, val in local.function_set : key => val if key != "send_test_sms" }
  name     = replace(each.key, "_", "-")
  location = local.region
  build_config {
    runtime     = "python310"
    entry_point = local.entry_points[each.key]
    source {
      storage_source {
        bucket = google_storage_bucket.function2.name
        object = google_storage_bucket_object.function2[each.key].name
      }
    }
  }

  service_config {
    available_memory      = local.function_memory[each.key]
    max_instance_count    = 100
    timeout_seconds       = 540
    service_account_email = google_service_account.function2_map[each.key].email
    environment_variables = local.environment_variables_map[each.key]
  }
  event_trigger {
    trigger_region = local.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.function2_map[each.key].id
    retry_policy   = "RETRY_POLICY_RETRY"
  }
  description = "${each.key} - cloud function v2."
}
resource "google_cloudfunctions2_function" "send_test_sms" {
  name     = "send-test-sms"
  location = local.region
  build_config {
    runtime     = "python310"
    entry_point = local.entry_points["send_test_sms"]
    source {
      storage_source {
        bucket = google_storage_bucket.function2.name
        object = google_storage_bucket_object.function2["send_test_sms"].name
      }
    }
  }

  service_config {
    available_memory      = local.function_memory["send_test_sms"]
    max_instance_count    = 100
    timeout_seconds       = 540
    service_account_email = google_service_account.function2_map["send_test_sms"].email
    environment_variables = local.environment_variables_map["send_test_sms"]
  }
  description = "send-test-sms - cloud function v2."
}
resource "google_cloud_run_service_iam_binding" "send_test_sms_allow_unauthenticated" {
  location = google_cloudfunctions2_function.send_test_sms.location
  service  = google_cloudfunctions2_function.send_test_sms.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}
