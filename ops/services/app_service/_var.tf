variable "az_account" {
  default = "prime-simple-report"
}
variable "env" {}
variable "name" {}
variable "resource_group_name" {}
variable "resource_group_location" {}

variable "docker_image_uri" {}
variable "webapp_subnet_id" {}

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

# https://azure.microsoft.com/en-us/pricing/details/app-service/windows/
variable "instance_tier" {
  default = "PremiumV2"
}

variable "instance_size" {
  default = "P1v2"
}

variable "instance_count" {
  default = 1
}

variable "deploy_info" {
  default = {}
}
