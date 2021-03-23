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

variable "administrator_login" {
  default = "simple_report"
}

variable "postgres_server_name" {
  type        = string
  description = "PostgreSQL Server name"
}

variable "postgres_readonly_user" {
  type        = string
  description = "PostgreSQL Database readonly user"
}

variable "postgres_readonly_pass" {
  type        = string
  description = "PostgreSQL Database readonly password"
}

variable "postgres_port" {
  type        = string
  description = "PostgreSQL database port"
}

variable "postgres_db_name" {
  type        = string
  description = "PostgreSQL database name"
}

variable "ai_instrumentation_key" {
  type        = string
  description = "Application Insights Instrumentation Key"
  sensitive   = true
}

# Secret Access
variable "key_vault_id" {}
variable "tenant_id" {}