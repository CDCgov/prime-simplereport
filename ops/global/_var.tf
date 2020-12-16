variable "resource_group" {
  description = "Resource Group to deploy to"
  default     = "prime-simple-report-management"
}

variable "infra_team" {
  description = "Object Ids for the infra team"
  type        = list(string)
}
