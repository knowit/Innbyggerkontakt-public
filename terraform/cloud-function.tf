data "external" "webapp_functions_zip_python" {
  program = ["python3", "zip_files.py"]
  query = {
    location                = "../webapp/functions/python"
    destination             = "cloud_functions/webapp/python/functions.zip"
    exclude                 = "*test* *__pycache__* *.pytestcache/ *install_local_dependencies.sh *.python-version *Dockerfile *.venv/*"
    include_packages_source = "true"
    add_in_folder           = "packages_source/"
  }
}

resource "google_storage_bucket_object" "webapp_functions_zip_python" {
  name   = format("%s/%s", "webapp_functions_python", data.external.webapp_functions_zip_python.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.webapp_functions_zip_python.result.destination
}

resource "google_cloudfunctions_function" "firestore_active_search" {
  name                  = "firestore_active_search"
  description           = "Triggered by creation in firestore bulletin/active/search"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "firestore_active_search"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_active_search.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.create"
    resource   = "organization/{organization_id}/bulletin/active/search/{bulletin_id}"
  }

  environment_variables = {
    RECIPIENTS_URL                     = module.cloud_run_recipients.url
    APP_ENGINE_REGION                  = google_cloud_tasks_queue.message.location
    SCHEDULED_BULLETIN_URL             = google_cloudfunctions_function.scheduled_bulletin.https_trigger_url
    SCHEDULE_BULLETIN_QUEUE            = google_cloud_tasks_queue.schedule_bulletin.name
    RECIPIENTS_TRIGGER_SERVICE_ACCOUNT = google_service_account.firestore_active_search.email
    MESSAGE_URL                        = google_cloudfunctions_function.message.https_trigger_url
    MESSAGE_QUEUE                      = google_cloud_tasks_queue.message.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT    = google_service_account.message_trigger.email
    FETCH_JOBB_ID_TOPIC                = google_pubsub_topic.function2_map["freg_fetch_jobbid"].name
    MESSAGE_STATUS_TOPIC               = google_pubsub_topic.message_status.name
    GCLOUD_PROJECT                     = var.project_id
  }
}

resource "google_cloudfunctions_function" "firestore_draft_manual_recipients" {
  name                  = "firestore_draft_manual_recipients"
  description           = "Triggered by creation in firestore bulletin/draft/manualRecipients"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "firestore_draft_manual_recipients"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_draft_mml.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.create"
    resource   = "organization/{organization_id}/bulletin/draft/default/{bulletin_id}/manualRecipients/{filter_id}"
  }

  environment_variables = {
    RECIPIENTS_URL                     = module.cloud_run_recipients.url
    APP_ENGINE_REGION                  = google_cloud_tasks_queue.message.location
    SCHEDULED_BULLETIN_URL             = google_cloudfunctions_function.scheduled_bulletin.https_trigger_url
    SCHEDULE_BULLETIN_QUEUE            = google_cloud_tasks_queue.schedule_bulletin.name
    RECIPIENTS_TRIGGER_SERVICE_ACCOUNT = google_service_account.firestore_draft_mml.email
    MESSAGE_URL                        = google_cloudfunctions_function.message.https_trigger_url
    MESSAGE_QUEUE                      = google_cloud_tasks_queue.message.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT    = google_service_account.message_trigger.email
    FETCH_JOBB_ID_TOPIC                = google_pubsub_topic.function2_map["freg_fetch_jobbid"].name
    MESSAGE_STATUS_TOPIC               = google_pubsub_topic.message_status.name
    GCLOUD_PROJECT                     = var.project_id

  }
}

resource "google_cloudfunctions_function" "cron_job_delete_outdated_mml" {
  name                  = "cron_job_delete_outdated_mml"
  description           = "Triggered by pubsub event from cron job that deleted outdated mml filters"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "cron_job_delete_outdated_mml"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.delete_mml_outdated.email

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.delete_mml_outdated.id
  }
}

resource "google_cloudfunctions_function" "firestore_active_search_deleted" {
  name                  = "firestore_active_search_deleted"
  description           = "Triggered by deleted document in firestore bulletin/active/search"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "firestore_active_search_deleted"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_active_search_deleted.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.delete"
    resource   = "organization/{organization_id}/bulletin/active/search/{bulletin_id}"
  }

  environment_variables = {
    APP_ENGINE_REGION       = google_cloud_tasks_queue.message.location
    SCHEDULE_BULLETIN_QUEUE = google_cloud_tasks_queue.schedule_bulletin.name
    GCLOUD_PROJECT          = var.project_id

  }
}

resource "google_cloudfunctions_function" "firestore_active_event" {
  name                  = "firestore_active_event"
  description           = "Triggered by change in firestore bulletin/active/event"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "firestore_active_event"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_active_event.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.create"
    resource   = "organization/{organization_id}/bulletin/active/event/{bulletin_id}"
  }

  environment_variables = {
    APP_ENGINE_REGION                  = google_cloud_tasks_queue.message.location
    SCHEDULED_BULLETIN_URL             = google_cloudfunctions_function.scheduled_bulletin.https_trigger_url
    RECIPIENTS_TRIGGER_SERVICE_ACCOUNT = google_service_account.firestore_active_search.email
    GCLOUD_PROJECT                     = var.project_id

  }
}



resource "google_cloudfunctions_function" "firestore_active_event_deleted" {
  name                  = "firestore_active_event_deleted"
  description           = "Triggered by deleted document in firestore bulletin/active/event"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "firestore_active_event_deleted"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_active_event_deleted.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.delete"
    resource   = "organization/{organization_id}/bulletin/active/event/{bulletin_id}"
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id

  }
}

resource "google_cloudfunctions_function" "message_trigger" {
  name                  = "message_trigger"
  description           = "Triggerd when recipients has published messages to ${google_pubsub_topic.recipients_status.name}"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "message_trigger"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.message_trigger.email

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.recipients_status.id
  }

  environment_variables = {
    MESSAGE_URL                     = google_cloudfunctions_function.message.https_trigger_url
    APP_ENGINE_REGION               = google_cloud_tasks_queue.message.location
    MESSAGE_QUEUE                   = google_cloud_tasks_queue.message.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT = google_service_account.message_trigger.email
    GCLOUD_PROJECT                  = var.project_id

  }
}

resource "google_cloudfunctions_function" "event_trigger" {
  name                  = "event_trigger"
  description           = "Triggered on every event added to ${google_pubsub_topic.freg_events.name} by the FREG event-feed in recipients"
  max_instances         = 20
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "event_trigger"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.event_trigger.email

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.freg_events.id

    failure_policy {
      retry = true
    }
  }

  environment_variables = {
    RECIPIENTS_URL                     = module.cloud_run_recipients.url
    MESSAGE_URL                        = google_cloudfunctions_function.message.https_trigger_url
    APP_ENGINE_REGION                  = google_cloud_tasks_queue.message.location
    MESSAGE_QUEUE                      = google_cloud_tasks_queue.message.name
    SCHEDULED_BULLETIN_URL             = google_cloudfunctions_function.scheduled_bulletin.https_trigger_url
    SCHEDULE_BULLETIN_QUEUE            = google_cloud_tasks_queue.schedule_bulletin.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT    = google_service_account.message_trigger.email
    RECIPIENTS_TRIGGER_SERVICE_ACCOUNT = google_service_account.firestore_active_search.email
    FETCH_JOBB_ID_TOPIC                = google_pubsub_topic.function2_map["freg_fetch_jobbid"].name
    MESSAGE_STATUS_TOPIC               = google_pubsub_topic.message_status.name
    GCLOUD_PROJECT                     = var.project_id

  }
}

resource "google_cloudfunctions_function" "scheduled_bulletin" {
  name                  = "scheduled_bulletin"
  description           = "Triggered on scheduled events"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "scheduled_bulletin"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_active_search.email
  trigger_http          = true

  environment_variables = {
    RECIPIENTS_URL                  = module.cloud_run_recipients.url
    MESSAGE_URL                     = google_cloudfunctions_function.message.https_trigger_url
    APP_ENGINE_REGION               = google_cloud_tasks_queue.message.location
    MESSAGE_QUEUE                   = google_cloud_tasks_queue.message.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT = google_service_account.message_trigger.email
    FETCH_JOBB_ID_TOPIC             = google_pubsub_topic.function2_map["freg_fetch_jobbid"].name
    MESSAGE_STATUS_TOPIC            = google_pubsub_topic.message_status.name
    GCLOUD_PROJECT                  = var.project_id
    MATRIKKEL_SEARCH_TOPIC          = google_pubsub_topic.function2_map["matrikkel_search"].name
  }
}


resource "google_cloudfunctions_function" "import_postal_codes" {
  name                  = "import_postal_codes"
  description           = "Triggerd by cron job"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "import_postal_codes"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.import_postal_codes.email
  trigger_http          = true

  environment_variables = {
    BRING_POSTAL_CODE_DOCUMENT = yamldecode(file("../config/environments.yml"))[var.project_id]["bring_postal_code_document"]
    GCLOUD_PROJECT             = var.project_id

  }
}

resource "google_cloudfunctions_function" "send_test" {
  name                  = "send_test"
  description           = "Triggered by http POST request"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "send_test_http_trigger"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.send_test.email
  trigger_http          = true

  environment_variables = {
    MESSAGE_URL                     = google_cloudfunctions_function.message.https_trigger_url
    APP_ENGINE_REGION               = google_cloud_tasks_queue.message.location
    MESSAGE_QUEUE                   = google_cloud_tasks_queue.message.name
    MESSAGE_TRIGGER_SERVICE_ACCOUNT = google_service_account.message_trigger.email
    CORS                            = yamldecode(file("../config/environments.yml"))[var.project_id]["cors"]
    GCLOUD_PROJECT                  = var.project_id

  }
}

resource "google_cloudfunctions_function_iam_member" "send_test_invoker" {
  region         = google_cloudfunctions_function.send_test.region
  cloud_function = google_cloudfunctions_function.send_test.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}

resource "google_cloudfunctions_function" "message_status" {
  name                  = "message_status_trigger"
  description           = "Triggered by pubsub event to ${google_pubsub_topic.message_status.name}"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "message_status_trigger"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.message_status.email

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.message_status.id
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id

  }
}

resource "google_cloudfunctions_function" "recipients_presearch" {
  name                  = "recipients_presearch"
  description           = "Triggered by http GET request"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_zip_python.name
  timeout               = 540
  entry_point           = "recipients_presearch"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.recipients_presearch.email
  trigger_http          = true

  environment_variables = {
    RECIPIENTS_URL = module.cloud_run_recipients.url
    CORS           = yamldecode(file("../config/environments.yml"))[var.project_id]["cors"]
    GCLOUD_PROJECT = var.project_id

  }
}

resource "google_cloudfunctions_function_iam_member" "recipients_presearch_invoker" {
  region         = google_cloudfunctions_function.recipients_presearch.region
  cloud_function = google_cloudfunctions_function.recipients_presearch.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}

data "external" "outcome_function_zip" {
  program = ["python3", "zip_files.py"]
  query = {
    location                = "../outcome/src"
    destination             = "cloud_functions/outcome/pubsub_listener.zip"
    exclude                 = "*test* *.egg-info* docker-compose.yml Dockerfile requirements_api.txt setup.py __init__.py .python-version api/* *__pycache__* *.pytestcache/ *install_local_dependencies.sh api_main.py *Dockerfile *.venv/*"
    include_packages_source = "true"
    add_in_folder           = "packages_source/"
  }
}

resource "google_storage_bucket_object" "outcome_function_zip" {
  name   = format("%s/%s", "outcome_functions", data.external.outcome_function_zip.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.outcome_function_zip.result.destination
}

resource "google_cloudfunctions_function" "outcome_pubsub_listener" {
  name                  = "outcome_pubsub_listener"
  description           = "Save outcome from recipinets and message"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.outcome_function_zip.name
  timeout               = 540
  entry_point           = "outcome_pubsub_listener"
  runtime               = "python310"
  region                = "europe-west1"
  service_account_email = google_service_account.outcome_pubsub_listener.email
  vpc_connector         = google_vpc_access_connector.outcome_db.self_link

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.outcome.id
  }

  environment_variables = {
    DB_CONNECTION_NAME = google_sql_database_instance.outcome_database_instance.private_ip_address
    GCLOUD_PROJECT     = var.project_id

  }
}

data "external" "message_function_zip" {
  program = ["python3", "zip_files.py"]
  query = {

    location    = "../message/message/"
    destination = "cloud_functions/message/message.zip"
    exclude     = "*test* setup.py __init__.py *.python-version *Dockerfile *__pycache__* *.pytestcache/ *install_local_dependencies.sh *.venv/*"

    include_packages_source = "true"
    add_in_folder           = "packages_source/"
  }
}

resource "google_storage_bucket_object" "message_function_zip" {
  name   = format("%s/%s", "message", data.external.message_function_zip.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.message_function_zip.result.destination
}

resource "google_cloudfunctions_function" "message" {
  name                  = "message"
  description           = "Message"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.message_function_zip.name
  timeout               = 540
  entry_point           = "message"
  runtime               = "python310"
  region                = "europe-west3"
  service_account_email = google_service_account.message.email
  trigger_http          = true

  environment_variables = {
    MAILJET_PROXY         = google_cloudfunctions_function.send_mail_proxy.https_trigger_url
    SERVICE_ACCOUNT       = google_service_account.message.email
    APP_ENGINE_REGION     = google_cloud_tasks_queue.mailjet.location
    MAILJET_TASK_QUEUE    = google_cloud_tasks_queue.mailjet.name
    KRR_ENDPOINT          = yamldecode(file("../config/environments.yml"))[var.project_id]["krr_endpoint"]
    KRR_SCOPE             = yamldecode(file("../config/environments.yml"))[var.project_id]["krr_scope"]
    MASKINPORTEN_ENDPOINT = yamldecode(file("../config/environments.yml"))[var.project_id]["maskinporten_endpoint"]
    OUTCOME_TOPIC         = google_pubsub_topic.outcome.name
    MESSAGE_STATUS_TOPIC  = google_pubsub_topic.message_status.name
    GCLOUD_PROJECT        = var.project_id
  }
}

data "external" "slack_notifier_function_zip" {
  program = ["python3", "zip_files.py"]
  query = {
    location    = "../slack_notifier"
    destination = "cloud_functions/slack_notifier/slack_notifier.zip"
    exclude     = "*test* *.python-version *__pycache__* *.pytestcache/ *.venv/*"
  }
}

resource "google_storage_bucket_object" "slack_notifier_function_zip" {
  name   = format("%s/%s", "slack_notifier", data.external.slack_notifier_function_zip.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.slack_notifier_function_zip.result.destination
}

resource "google_cloudfunctions_function" "slack_notifier" {
  name                  = "slack_notifier"
  description           = "Slack notifier"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.slack_notifier_function_zip.name
  timeout               = 20
  entry_point           = "slack_notifier"
  runtime               = "python310"
  region                = "europe-west3"

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.logs.id
  }

  environment_variables = {
    SLACK_WEBHOOK_URL = yamldecode(file("../config/environments.yml"))[var.project_id]["slack_webhook_url"]
  }
}


data "external" "webapp_functions_styles_zip_node" {
  program = ["python3", "zip_files.py"]
  query = {
    location    = "../webapp/functions/node/styles"
    destination = "cloud_functions/webapp/node/functions.zip"
    exclude     = "*test* *Dockerfile"
  }
}

resource "google_storage_bucket_object" "webapp_functions_styles_zip_node" {
  name   = format("%s/%s", "webapp_functions_node", data.external.webapp_functions_styles_zip_node.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.webapp_functions_styles_zip_node.result.destination
}

resource "google_cloudfunctions_function" "firestore_create_style" {
  name                  = "firestore_create_style"
  description           = "Triggered by new doc in firestore organization/{orgId}/styles/{styleId}"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_styles_zip_node.name
  timeout               = 540
  entry_point           = "firestoreCreateStyle"
  runtime               = "nodejs12"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_styles.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.create"
    resource   = "organization/{orgId}/styles/{styleId}"
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }
}

resource "google_cloudfunctions_function" "firestore_update_style" {
  name                  = "firestore_update_style"
  description           = "Triggered by update in firestore organization/{orgId}/styles/{styleId}"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_styles_zip_node.name
  timeout               = 540
  entry_point           = "firestoreUpdateStyle"
  runtime               = "nodejs12"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_styles.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.update"
    resource   = "organization/{orgId}/styles/{styleId}"
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }
}

resource "google_cloudfunctions_function" "firestore_delete_style" {
  name                  = "firestore_delete_style"
  description           = "Triggered by deleted doc in firestore organization/{orgId}/styles/{styleId}"
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_styles_zip_node.name
  timeout               = 540
  entry_point           = "firestoreDeleteStyle"
  runtime               = "nodejs12"
  region                = "europe-west3"
  service_account_email = google_service_account.firestore_styles.email

  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.delete"
    resource   = "organization/{orgId}/styles/{styleId}"
  }

  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }
}

resource "google_cloudfunctions_function" "mail_template_content" {
  name                  = "mail_template_content"
  description           = "Triggered by a HTTP get request."
  available_memory_mb   = 256
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.webapp_functions_styles_zip_node.name
  timeout               = 540
  entry_point           = "mailTemplateContent"
  runtime               = "nodejs12"
  region                = "europe-west3"
  service_account_email = google_service_account.mail_template_content.email
  trigger_http          = true
  environment_variables = {
    GCLOUD_PROJECT = var.project_id
  }
}

resource "google_cloudfunctions_function_iam_member" "mail_template_content_invoker" {
  region         = google_cloudfunctions_function.mail_template_content.region
  cloud_function = google_cloudfunctions_function.mail_template_content.name

  role   = "roles/cloudfunctions.invoker"
  member = "allUsers"
}


data "external" "send_mail_proxy" {
  program = ["python3", "zip_files.py"]
  query = {
    location                = "../message/proxy"
    destination             = "cloud_functions/message/proxy.zip"
    exclude                 = "*test* *.venv/* *.pytestcache/"
    include_packages_source = "true"
    add_in_folder           = "packages_source/"
  }
}

resource "google_storage_bucket_object" "send_mail_proxy" {
  name   = format("%s/%s", "send_mail_proxy", data.external.send_mail_proxy.result.output_md5)
  bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source = data.external.send_mail_proxy.result.destination
}

resource "google_cloudfunctions_function" "send_mail_proxy" {
  name                  = "send_mail_proxy"
  description           = "Proxy to log responses from mailjet"
  available_memory_mb   = 1024
  source_archive_bucket = google_storage_bucket.cloud_functions_source_code_bucket.name
  source_archive_object = google_storage_bucket_object.send_mail_proxy.name
  timeout               = 540
  entry_point           = "send_mail_proxy"
  runtime               = "python310"
  region                = "europe-west6"
  service_account_email = google_service_account.send_mail_proxy.email
  trigger_http          = true

  environment_variables = {
    SERVICE_ACCOUNT    = google_service_account.send_mail_proxy.email
    APP_ENGINE_REGION  = google_cloud_tasks_queue.mailjet.location
    MAILJET_TASK_QUEUE = google_cloud_tasks_queue.mailjet.name
  }
}
