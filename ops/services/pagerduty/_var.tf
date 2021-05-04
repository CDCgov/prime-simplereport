variable "resource_group_name" {
  description = "The name of the resource group where we will create Azure resources"
  type        = string
}

variable "pagerduty_service_name" {
  description = "The name of the PagerDuty service we will send things to"
  type        = string
}

variable "action_group_short_name" {
  description = "The short name (very shor!) of the action group we are creating."
  type        = string
  default     = "SR-ALERTS"
}
