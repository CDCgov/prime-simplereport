variable "name" {}
variable "app_insight_id" {}
variable "test_url" {
  description = "Url to ping"
}
variable "action_group_id" {}

variable "severity" {
  default = 1
}
variable "enabled" {
  default = true
}
variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
}

variable "tags" {
  default = {}
}

variable "wiki_docs_text" {
  description = "Custom properties text to include the alert response docs"
  type        = string
  default     = "{\"Alert Response Docs\": \"https://github.com/CDCgov/prime-simplereport/wiki/Alert-Response\" }"
}
