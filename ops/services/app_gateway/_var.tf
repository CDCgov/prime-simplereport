variable "name" {}
variable "env" {}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "tags" {}

variable "cdn_hostname" {}
variable "blob_endpoint" {}
variable "subnet_id" {}

# https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-autoscaling-zone-redundant
variable "sku_tier" {
  default = "Standard_v2"
}
variable "sku_name" {
  default = "Standard_v2"
}

variable "autoscale_min" {
  default = 0
}
variable "autoscale_max" {
  default = 4
}

variable "fqdns" {
  type    = list(string)
  default = []
}

variable "ip_addresses" {
  type    = list(string)
  default = []
}

variable "key_vault_id" {}

variable "log_workspace_uri" {
  description = "Full URI of log workspace to report to"
  type        = string
}