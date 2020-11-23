variable "env" {
  type = string
}

variable "tags" {
  description = "tags for resources created"
  type        = map(string)
}

variable "rg_name" {
  description = "Name of resource group to deploy into"
  type = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type = string
}

variable "key_vault_id" {
  description = "ID of Key Vault to fetch secret from"
  type = string
}

variable "log_workspace_id" {
  description = "ID of Log Analytics Workspace to send values to"
  type = string
}

// Note: Rotating the master password has a race condition
// Terraform initializes the postgres module before it rotates the password
// Terraform will succeed on the plan phase, but fail during apply
// This is expected. Just run the deploy a second time and it will succeeed
// To fix, the postgres module could be refactored into the main terraform state
variable "master_password_rotated" {
  description = "Changing this value will force the master database password to rotate. This can be any string, but a date is encourage to make tracking rotation easier."
  type        = string
  default     = "2020-11-23T00:00:00"
}

variable "inbound_subnets" {
  description = "(Optional) List of subnet IDs to allow to connect to the database"
  type = map(string)
  default = {}
}
