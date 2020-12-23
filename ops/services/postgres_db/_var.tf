variable "env" {
  type = string
}

variable "tags" {
  description = "tags for resources created"
  type        = map(string)
}

variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
}

variable "global_vault_id" {
  type = string
}

variable "db_vault_id" {
  type = string
}

variable "db_encryption_key_id" {
  type = string
}

variable "log_workspace_id" {
  description = "ID of Log Analytics Workspace to send values to"
  type        = string
}

variable "administrator_login" {
  default = "simple_report"
}

variable "db_table" {
  default = "simple_report"
}

variable "tls_enabled" {
  type    = bool
  default = false
}
