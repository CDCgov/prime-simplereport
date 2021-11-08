variable "env" {}
variable "app_insights_id" {}
variable "app_service_plan_id" {}
variable "app_service_id" {}
variable "action_group_ids" {
  description = "The IDs of the monitor action group resources to send events to"
  type        = list(string)
}

variable "severity" {
  default = 3
}
variable "disabled_alerts" {
  default     = []
  description = "All alerts are enabled for an environment by default. You can disable alert(s) for an environment by including their resource name in this list. Example: [\"cpu_util\"] would disable the CPU utilization alert, since it matches the azurerm_monitor_metric_alert.cpu_util resource."
  type        = list(string)
  validation {
    // Set the list of valid disabled alerts to prevent misconfigured commits
    condition = length(setsubtract(var.disabled_alerts, [
      "cpu_util",
      "mem_util",
      "http_response_time",
      "http_2xx_failed_requests",
      "http_4xx_errors",
      "http_401_410_errors",
      "http_5xx_errors",
      "first_error_in_a_week",
      "account_request_failures",
      "frontend_error_boundary",
      "db_query_duration",
      "db_query_duration_over_time_window",
    ])) == 0
    error_message = "One or more disabled_alert values are invalid."
  }
}
variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
  default     = "eastus"
}

variable "tags" {
  default = {}
}

# Monitoring settings
variable "mem_threshold" {
  default = 70
}

variable "cpu_threshold" {
  default = 70
}

variable "cpu_window_size" {
  default = "PT30M"
}

variable "http_response_time_aggregation" {
  default = "Average"
}

variable "failed_http_2xx_threshold" {
  // The resource that uses this value doesn't have a >= check, so we need n - 1 here
  default = 9
}

variable "skip_on_weekends" {
  default = false
}

// Additional URLs to monitor via App Insights availability tests
// Format: map of { test name = URL } pairs
variable "additional_uptime_test_urls" {
  type    = map(string)
  default = {}
}
