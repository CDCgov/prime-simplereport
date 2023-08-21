variable "env" {
  description = "values: [demo, dev, dev2, dev3, dev4, dev5, dev6, dev7, pentest, test, training, stg, prod]"
  type        = string
}
variable "name" {
  description = "The name of the application"
  type        = string
}
variable "resource_group_name" {
  description = "The name of the resource group to deploy to"
  type        = string
}
variable "resource_group_location" {
  description = "The location of the resource group to deploy to"
  type        = string
}

# ACR info
variable "acr_username" {
  description = "The username for the ACR"
  type        = string
  default     = "simplereportacr"
}
variable "acr_password" {
  description = "The password for the ACR"
  type        = string
  sensitive   = true
}
variable "acr_server" {
  description = "The server for the ACR"
  type        = string
  default     = "simplereportacr.azurecr.io"
}

# Client container specifics
variable "subnet_id" {
  description = "The subnet to deploy the container instance to"
  type        = string
}

variable "storage_account_name" {
  description = "The name of the Azure storage account for data export"
  type        = string
}

variable "storage_account_key" {
  description = "The key for the Azure storage account for data export"
  type        = string
}

variable "storage_share_name" {
  description = "The name of the Azure storage account share for data export"
  type        = string
}