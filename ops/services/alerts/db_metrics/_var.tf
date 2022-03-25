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
