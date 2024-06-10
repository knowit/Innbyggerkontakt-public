terraform {
  required_version = ">= 1.0.4"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.37.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.37.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.20.0"
    }
    external = {
      source  = "hashicorp/external"
      version = "~> 2.3.3"
    }
  }
}
