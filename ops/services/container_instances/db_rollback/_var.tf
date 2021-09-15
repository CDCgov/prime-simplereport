variable "env" {}
variable "name" {}
variable "resource_group_name" {}
variable "resource_group_location" {}

variable "network_profile_id" {}

# ACR info
variable "acr_username" {
  default = "simplereportacr"
}

variable "acr_password" {
  sensitive = true
}

variable "acr_server" {
  default = "simplereportacr.azurecr.io"
}

# Rollback info

variable "rollback_tag" {}

variable "spring_datasource_url" {}
