variable "env" {
  description = "Environment to deploy into"
  type = string
}

variable "user_groups" {
  description = "List of user groups to assign to the application"
  type = list(string)
  default = []
}

variable "admin_groups" {
  description = "List of user groups to assign to the application as administrators"
  type = list(string)
  default = []
}
