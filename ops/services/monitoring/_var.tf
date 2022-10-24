variable "env" {
  description = "Environment to deploy into"
  type        = string
}

variable "management_rg" {
  description = "Name of management RG"
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

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
}

variable "app_url" {
  description = "test that the app_url is running."
  default     = "simplereport.cdc.gov"
}

variable "ai_ingest_cap_gb" {
  description = "Cap for data ingested into Application Insights, per day."
  default     = 50
}

variable "ai_retention_days" {
  description = "Number of days to retain Application Insights data."
  default     = 90
}