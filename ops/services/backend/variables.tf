variable "env" {
  description = "Environment to deploy into"
  type        = string
}

variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
}

variable "key_vault_id" {
  description = "ID of Key Vault to fetch secret from"
  type        = string
}

variable "log_workspace_id" {
  description = "ID of Log Analytics Workspace to send values to"
  type        = string
}

variable "log_workspace_uri" {
  description = "Full URI of log workspace to report to"
  type        = string
}

variable "log_workspace_key" {
  description = "Access Key for Log Workspace"
  type        = string
}

variable "backend_scale" {
  default     = 3
  description = "Number of backend containers to start"
  type        = number
}

variable "network_name" {
  description = "Name of virtual network to attach to"
  type        = string
}

variable "container_id" {
  description = "Docker container to deploy"
  type        = string
}

variable "db_dns_name" {
  description = "FQDN of DB to connect to"
  type        = string
}

variable "db_server_name" {
  description = "Name of DB server"
  type        = string
}

variable "db_username" {
  description = "Username to connect to DB with"
  type        = string
}

variable "db_name" {
  description = "Database name to connect to"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}
