variable "name" {}
variable "env" {}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "tags" {}
variable "subnet_webapp_id" {}
variable "subnet_lb_id" {}

variable "zones" {
  type    = list(string)
  default = ["1", "2", "3"]
}