variable "project_id" {}

variable "github" {
  type = map(string)
  default = {
    user  = "innbyggerkontakt"
    owner = "knowit"
    repo  = "Innbyggerkontakt"
  }
}

variable "terraform" {
  type = map(string)
  default = {
    current_version = "1.3.5"
    next_version    = "1.3.6"
  }
}
