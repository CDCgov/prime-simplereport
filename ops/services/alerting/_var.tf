variable "rg_name" {
  description = "Name of resource group to deploy into"
  type        = string
}

variable "rg_location" {
  description = "Location of resource group to deploy into"
  type        = string
}

variable "storage_account" {
  description = "Storage account to use for Azure alert functions"
  type        = string
}

variable "function_app" {
  description = "zip-file of function"
  type        = string
}
