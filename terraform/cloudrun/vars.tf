variable "project" {}
variable "name" {}
variable "image" {}
variable "location" {}
variable "service_account_name" {}
variable "annotations" {}
variable "protocol" {
  description = "grpc or http"
}
variable "environment_variables" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}
variable "auth" {
  type    = bool
  default = true
}
variable "timeout_seconds" {
  type    = number
  default = 300
}
