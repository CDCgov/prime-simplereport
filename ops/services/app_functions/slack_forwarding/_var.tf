variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
}

variable "storage_account" {
  description = "Storage account to use for Azure alert functions"
  type        = string
}

variable "function_app" {
  description = "zip-file of function"
  type        = string
}

variable "key_vault_id" {
  description = "ID of Key Vault to fetch secret from"
  type        = string
}

variable "app_insights_key" {
  description = "App Insights Instrumentation Key"
  type        = string
}

variable "app_insights_connection_string" {
  description = "App Insights Connection String"
  type        = string
}

variable "alert_function_name" {
  description = "Name of Azure Function for routing alerts"
  default     = "prime-simple-report-error-manager"
  type        = string
}

variable "log_workspace_id" {
  description = "ID of log workspace to report to"
  type        = string
}
