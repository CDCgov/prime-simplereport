variable "az_account" {
  default = "prime-simple-report"
}
variable "env" {}
variable "resource_group_name" {}
variable "resource_group_location" {}
variable "tags" {}

variable "virtual_network" {}

variable "zones" {
  type    = list(string)
  default = ["1", "2", "3"]
}