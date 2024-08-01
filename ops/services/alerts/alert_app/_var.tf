
variable "action_group_ids" {
  default = ["/subscriptions/7D1E3999-6577-4CD5-B296-F518E5C8E677/resourceGroups/prime-simple-report-prod/providers/microsoft.insights/actionGroups/On Call"]
  description = "The IDs of the monitor action group resources to send events to"
  type        = list(string)
}


variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
  default = "prime-simple-report-prod"
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
  default     = "eastus"
}






