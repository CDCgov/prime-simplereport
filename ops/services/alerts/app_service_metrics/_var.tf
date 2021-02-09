variable "env" {}
variable "app_service_plan_id" {}
variable "action_group_id" {}

variable "severity" {
  default = 3
}
variable "enabled" {
  default = true
}
variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "tags" {
  default = {}
}