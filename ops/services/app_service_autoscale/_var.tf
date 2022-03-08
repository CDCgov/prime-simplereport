variable "name" {}
variable "env" {}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "tags" {}

variable "target_resource_id" {
  type = string
}

variable "peak_capacity_instances" {
  default = 1
}

variable "weekend_capacity_instances" {
  default = 1
}