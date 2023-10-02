variable "env" {}

variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}
variable "db_id" {}

variable "db_storage_threshold" {
  description = "Percentage of DB storage that can be used before alerting"
  type        = string
  default     = "80"
}

variable "action_group_ids" {
  description = "The IDs of the monitor action group resources to send events to"
  type        = list(string)
}

variable "wiki_docs_json" {
  description = "Custom properties json to include the alert response docs"
  type        = map(string)
  default     = { "Alert Response Docs" : "https://github.com/CDCgov/prime-simplereport/wiki/Alert-Response" }
}

variable "cdc_tags" {
  description = "tags for resources created"
  type        = map(string)
}