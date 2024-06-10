resource "google_compute_network" "outcome_db" {
  name = "private-outcome-db-network"
}

resource "google_compute_global_address" "outcome_db" {
  name          = "outcome-db-private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.outcome_db.id
}

resource "google_service_networking_connection" "outcome_db" {
  network                 = google_compute_network.outcome_db.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.outcome_db.name]
}

resource "google_vpc_access_connector" "outcome_db" {
  name          = "outcome-db-connector"
  region        = "europe-west1"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.outcome_db.name
}
