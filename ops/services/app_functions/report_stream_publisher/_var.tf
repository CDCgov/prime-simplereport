variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
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

variable "log_workspace_id" {
  description = "ID of log workspace to report to"
  type        = string
}

variable "storage_account" {
  description = "Storage account to use for Azure alert functions"
  type        = string
}

variable "report_stream_key_key_vault_id" {
  description = "ID of Key Vault to fetch the ReportStream key from"
  type        = string
}

variable "report_stream_key_secret_name" {
  description = "Name of the KeyVault secret holding the ReportStream key"
  type        = string
}

variable "queue_name" {
  type        = string
  description = "The name of the queue in which TestEvents will be staged for publication to ReportStream."
}

variable "queue_connection_string" {
  type        = string
  description = "The name of an app setting that contains the Storage connection string to use for this binding."
}

variable "report_stream_upload_url" {
  type        = string
  description = "The ReportStream URL to which test events should be sent."
  default     = "https://prime-data-hub-test.azurefd.net/api/reports?option=SkipSend"
}

variable "enabled" {
  type        = bool
  default     = true
  description = "Whether this function and binding should be enabled"
}
