variable "env" {}
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
}
variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "tags" {
  default = {}
}

# Thresholds
variable "mem_threshold" {
  default = 70
}
