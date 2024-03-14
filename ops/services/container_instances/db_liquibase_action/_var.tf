variable "env" {
  description = "values: [demo, dev, dev2, dev3, dev4, dev5, dev6, pentest, test, training, stg, prod]"
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
variable "image_action" {
  description = "The liquibase action to perform"
  type        = string
  default     = null
}

# Rollback info
variable "rollback_tag" {
  description = "The tag to rollback to"
  type        = string
}
variable "spring_datasource_url" {
  description = "The JDBC URL for the database"
  type        = string
  sensitive   = true
}
variable "subnet_id" {
  description = "The subnet to deploy the container instance to"
  type        = string
}
