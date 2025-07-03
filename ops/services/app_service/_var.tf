variable "az_account" {
  default = "prime-simple-report"
}
variable "env" {}
variable "env_index" {
  description = "A 1-indexed variable denoting which environment in the environment level these resources apply to."
  default     = 1
}
variable "name" {}
variable "resource_group_name" {}
variable "resource_group_location" {}

variable "docker_image_name" {}
variable "docker_image_tag" {}
variable "webapp_subnet_id" {}
variable "lb_subnet_id" {}
variable "docker_settings" {
  default = {}
}
variable "app_settings" {
  default = {}
}
variable "https_only" {
  type    = bool
  default = false
}

# Secret Access
variable "key_vault_id" {}
variable "tenant_id" {}

variable "instance_count" {
  default = 1
}

variable "deploy_info" {
  default = {}
}

# https://azure.microsoft.com/en-us/pricing/details/app-service/windows/
variable "sku_name" {
  default = "P1v3"
}
