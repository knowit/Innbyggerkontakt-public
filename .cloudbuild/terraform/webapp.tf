resource "google_cloudbuild_trigger" "webapp_pr_yarn_build-dev" {
  provider = google-beta
  name     = "Webapp-pr-yarn-build"
  filename = ".cloudbuild/yarn_build-dev.yml"
  included_files = [
    "webapp/**"
  ]
  ignored_files = [
    "webapp/cloudrun/**",
    "webapp/functions/**"
  ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    pull_request {
      branch          = ".*"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }
  substitutions = {
    _DIR          = "webapp/"
    _NODE_VERSION = "16-alpine3.12"
    _GH_USER      = var.github.user
    _GH_OWNER     = var.github.owner
  }
}

resource "google_cloudbuild_trigger" "webapp_pr_yarn_deploy-dev" {
  provider = google-beta
  name     = "Webapp-pr-yarn-deploy"
  filename = ".cloudbuild/yarn_deploy-dev.yml"
  included_files = [
    "webapp/**"
  ]
  ignored_files = [
    "webapp/cloudrun/**",
    "webapp/functions/**"
  ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    pull_request {
      branch          = ".*"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }
  substitutions = {
    _DIR             = "webapp/"
    _NODE_VERSION    = "16-alpine3.12"
    _GH_USER         = var.github.user
    _GH_OWNER        = var.github.owner
    _BUILD_ENV       = "development"
    _SUPPRESS_OUTPUT = true
    _KMS_KEYRING     = "cloud-build"
    _KMS_CRYPTOKEY   = "react-env-vars"
  }
}

resource "google_cloudbuild_trigger" "webapp_yarn_deploy_live-dev" {
  provider = google-beta
  name     = "Webapp-yarn-deploy-live"
  filename = ".cloudbuild/yarn_deploy-dev.yml"
  included_files = [
    "webapp/**"
  ]
  ignored_files = [
    "webapp/cloudrun/**",
    "webapp/functions/**"
  ]
  github {
    owner = var.github.owner
    name  = var.github.repo
    push {
      branch = "^master$"
    }
  }
  substitutions = {
    _DIR             = "webapp/"
    _NODE_VERSION    = "16-alpine3.12"
    _GH_USER         = var.github.user
    _GH_OWNER        = var.github.owner
    _BUILD_ENV       = "development"
    _SUPPRESS_OUTPUT = true
    _KMS_KEYRING     = "cloud-build"
    _KMS_CRYPTOKEY   = "react-env-vars"
    _LIVE            = true
  }
}
