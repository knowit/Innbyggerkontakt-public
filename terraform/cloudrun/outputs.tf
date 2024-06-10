output "url" {
  value = google_cloud_run_service.service.status[0].url
}

output "location" {
  value = google_cloud_run_service.service.location
}

output "name" {
  value = google_cloud_run_service.service.name
}
