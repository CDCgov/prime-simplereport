variable "name" {}
variable "env" {}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "tags" {}

variable "blob_endpoint" {}
variable "subnet_id" {}

# https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-autoscaling-zone-redundant
variable "sku_tier" {
  default = "WAF_v2"
}
variable "sku_name" {
  default = "WAF_v2"
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

variable "metabase_fqdns" {
  type    = list(string)
  default = []
}

variable "staging_fqdns" {
  type    = list(string)
  default = []
}

variable "ip_addresses" {
  type    = list(string)
  default = []
}

variable "metabase_ip_addresses" {
  type    = list(string)
  default = []
}

variable "staging_ip_addresses" {
  type    = list(string)
  default = []
}

variable "key_vault_id" {}

variable "log_workspace_uri" {
  description = "Full URI of log workspace to report to"
  type        = string
}

variable "firewall_policy_id" {
  description = "Identifier corresponding to existing WAF policy to be associated with this application gateway."
  type        = string
  default     = null
}

variable "zones" {
  type    = list(string)
  default = ["1", "2", "3"]
}

variable "cdc_tags" {
  description = "cdc tags for resources"
  type        = map(string)
}