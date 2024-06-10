locals {
  sanity_dataset    = "documentation-prod"
  sanity_project_id = "ss3wtm5r"
}

resource "google_secret_manager_secret" "sanity_webhook_secret" {
  secret_id = "sanity_webhook_secret"
  labels    = {}

  replication {
    automatic = true
  }
}

data "google_secret_manager_secret_version" "sanity_webhook_secret_content" {
  secret = google_secret_manager_secret.sanity_webhook_secret.id
}

resource "google_cloudbuild_trigger" "website-deploy-dev" {
  provider = google
  name     = "Website-build-and-deploy"
  filename = ".cloudbuild/gatsby_sanity_build.yml"
  included_files = [
    "website/**"
  ]
  #   ignored_files = [
  #     "webapp/cloudrun/**",
  #     "webapp/functions/**"
  #   ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _BUILD_ENV           = "development"
    _DIR                 = "website/"
    _NODE_VERSION        = "18-alpine3.15"
    _GH_USER             = var.github.user
    _GH_OWNER            = var.github.owner
    _SANITY_DATASET      = local.sanity_dataset
    _SANITY_PROJECT_ID   = local.sanity_project_id
    _FIREBASE_PROJECT_ID = "innbyggerkontakt-dev"
    _SUPPRESS_OUTPUT     = true
  }
}

resource "google_cloudbuild_trigger" "website-sanity-deploy-dev" {
  provider    = google
  name        = "website-sanity-deploy-dev"
  description = "Trigger website build on changes from sanity"
  filename    = ".cloudbuild/gatsby_sanity_build.yml"

  webhook_config {
    secret = data.google_secret_manager_secret_version.sanity_webhook_secret_content.name
  }

  source_to_build {
    uri       = "https://github.com/knowit/Innbyggerkontakt"
    ref       = "refs/heads/master"
    repo_type = "GITHUB"
  }

  substitutions = {
    _DIR                 = "website/"
    _BUILD_ENV           = "development"
    _NODE_VERSION        = "18-alpine3.15"
    _SANITY_DATASET      = local.sanity_dataset
    _SANITY_PROJECT_ID   = local.sanity_project_id
    _FIREBASE_PROJECT_ID = "innbyggerkontakt-dev"
    _SUPPRESS_OUTPUT     = "true"
  }
}

resource "google_cloudbuild_trigger" "website-sanity-deploy-prod" {
  provider    = google
  name        = "website-sanity-deploy-prod"
  description = "Trigger website build on changes from sanity"
  filename    = ".cloudbuild/gatsby_sanity_build.yml"

  webhook_config {
    secret = data.google_secret_manager_secret_version.sanity_webhook_secret_content.name
  }

  source_to_build {
    uri       = "https://github.com/knowit/Innbyggerkontakt"
    ref       = "refs/heads/master"
    repo_type = "GITHUB"
  }

  substitutions = {
    _DIR                 = "website/"
    _BUILD_ENV           = "production"
    _NODE_VERSION        = "18-alpine3.15"
    _SANITY_DATASET      = local.sanity_dataset
    _SANITY_PROJECT_ID   = local.sanity_project_id
    _FIREBASE_PROJECT_ID = "innbyggerkontakt"
    _SUPPRESS_OUTPUT     = "true"
  }
}
