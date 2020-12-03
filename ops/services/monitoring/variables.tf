variable "env" {
  description = "Environment to deploy into"
  type = string
}

variable "management_rg" {
  description = "Name of management RG"
  type = string
}

variable "rg_name" {
  description = "Name of resource group to deploy into"
  type = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type = map(string)
}
