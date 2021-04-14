variable "name" {
  type        = string
  description = "App Service Name"
}

variable "env" {
  type        = string
  description = "Target Environment"
}

variable "resource_group_name" {
  type        = string
  description = "Resource Group Name"
}

variable "resource_group_location" {
  type        = string
  description = "App Service Location"
}

variable "app_service_plan_id" {
  type        = string
  description = "App Service Plan ID"
}

variable "webapp_subnet_id" {
  type        = string
  description = "Webapp Subnet ID"
}


variable "postgres_server_name" {
  type        = string
  description = "PostgreSQL Server name"
}

variable "postgres_url" {
  type        = string
  description = "PostgreSQL Connection URL"
}

variable "ai_instrumentation_key" {
  type        = string
  description = "Application Insights Instrumentation Key"
  sensitive   = true
}

variable "app_settings_overrides" {
  description = "override values for app_settings"
  default     = {}
}

# Secret Access
variable "key_vault_id" {}
variable "tenant_id" {}