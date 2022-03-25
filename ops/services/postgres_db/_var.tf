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

// TODO: remove this when removing old DB config
variable "old_subnet_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

// TODO: remove this when removing old DB config
variable "dns_zone_id" {
  type = string
}

variable "nophi_user_password" {
  description = "Password for the simple_report_no_phi user."
  type        = string
  sensitive   = true
}
