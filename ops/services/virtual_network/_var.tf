variable "project" {
  default = "prime"
}

variable "app_name" {
  default = "simple-report"
}

variable "env" {
  description = "values: [demo, dev, dev2, dev3, dev4, dev5, dev6, dev7, pentest, test, training, stg, prod]"
  type        = string
}

variable "env_level" {
  description = "Pipeline level that this environment is a member of."
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group to deploy to"
  type        = string
}

variable "network_address" {
  description = "The network address of the virtual network"
}
variable "management_tags" {
  description = "The tags to apply to the management resources"
  type        = map(string)
}

variable "location" {
  description = "The location of the resource group to deploy to"
  type        = string
}
