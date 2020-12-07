variable "az_account" {
  default = "prime-simple-report"
}
variable "env" {}
variable "name" {}
variable "resource_group_name" {}
variable "resource_group_location" {}

variable "docker_image_uri" {}
variable "app_settings" {
  default = {}
}

# https://azure.microsoft.com/en-us/pricing/details/app-service/windows/
variable "instance_tier" {
  default = "Basic"
}

variable "instance_size" {
  default = "B1"
}