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

variable "service_plan_id" {
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

variable "postgres_server_fqdn" {
  type        = string
  description = "PostgreSQL FQDN"
}

variable "postgres_url" {
  type        = string
  description = "PostgreSQL Connection URL"
}

variable "postgres_admin_username" {
  type        = string
  description = "PostgreSQL admin username"
}

variable "postgres_admin_password" {
  type        = string
  description = "PostgreSQL admin password"
  sensitive   = true
}

variable "postgres_metabase_username" {
  type        = string
  description = "PostgreSQL username for Metabase user"
}

variable "postgres_metabase_password" {
  type        = string
  description = "PostgreSQL password for Metabase user"
  sensitive   = true
}

variable "ai_instrumentation_key" {
  type        = string
  description = "Application Insights Instrumentation Key"
  sensitive   = true
}

variable "lb_subnet_id" {}

variable "metabase_url" {
  type        = string
  description = "Metabase URL"
}

# Secret Access
variable "key_vault_id" {}
variable "tenant_id" {}
