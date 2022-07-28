variable "project" {
  default = "prime"
}

variable "app_name" {
  default = "simple-report"
}

variable "env" {}
variable "env_level" {
  description = "Pipeline level that this environment is a member of."
  type        = string
}

variable "resource_group_name" {}

variable "network_address" {}
variable "management_tags" {}

variable "location" {}

