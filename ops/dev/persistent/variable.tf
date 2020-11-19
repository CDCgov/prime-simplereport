variable "resource_group" {
  description = "Resource Group to deploy to"
}

variable "log_analytics_name" {
  description = "Name of log analytics workspace"
  default = "pdi-log-workspace"
}
