variable "env" {
  description = "Environment to deploy into"
  type = string
}

variable "management_rg" {
  description = "RG holding the management infrastructure"
  default = "prime-simple-report-management"
  type = string
}
