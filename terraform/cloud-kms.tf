resource "google_kms_key_ring" "cloud_build" {
  name     = "cloud-build"
  location = "global"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "react_env" {
  name     = "react-env-vars"
  key_ring = google_kms_key_ring.cloud_build.id
  purpose  = "ENCRYPT_DECRYPT"

  lifecycle {
    prevent_destroy = true
  }
}
