variable "env" {
  description = "Environment to deploy into"
  type        = string
}

variable "user_groups" {
  description = "List of user groups to assign to the application"
  type        = list(string)
  default     = []
}

variable "admin_groups" {
  description = "List of user groups to assign to the application as administrators"
  type        = list(string)
  default     = []
}

variable "redirect_urls" {
  description = "Additional redirect URLs for Okta applications (defaults to dev URLs)"
  default = [
    "http://localhost:8080",
    "http://localhost:9090",
    "http://localhost:3000",
    "https://simple-report-qa.app.cloud.gov/",
    "https://simple-report-qa-api.app.cloud.gov/",
    "https://simplereport.gov/app"
  ]
}

variable "app_url" {
  type = string
}

variable "logout_redirect_uris" {
  description = "Where to redirect users on logout"
  type        = string
}
