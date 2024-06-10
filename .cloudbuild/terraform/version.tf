terraform {
  required_version = ">= 1.0.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.37.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.32.0"
    }
  }
}
