variable "prefix" {
  type    = string
  default = "test-data-publisher"
}

variable "location" {
  type    = string
  default = "eastus"
}

variable "environment" {
  type = string
}

variable "env_level" {
  description = "Pipeline level that this environment is a member of."
  type        = string
}

variable "tenant_id" {}

variable "resource_group_name_prefix" {
  type    = string
  default = "prime-simple-report-"
}

variable "function_app_source" {
  type    = string
  default = "./functions/build/test-data-publisher.zip"
}

variable "lb_subnet_id" {}