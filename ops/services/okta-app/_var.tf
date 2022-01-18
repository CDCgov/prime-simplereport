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
    "https://staging.simplereport.org/app",
    "https://simplereport.cdc.gov/app",
    "https://simplereport.gov/app",
    "https://www.simplereport.gov/app"
  ]
}

variable "trusted_origin_preview_urls" {
  description = "Trusted origin listing for the Okta Preview environment. Data format is [Name, URL, [Scopes]]"
  default = [
    ["localhost", "https://localhost.simplereport.gov", ["CORS, REDIRECT"]],
  ]
}

// NOTE: These URLs reflect SimpleReport sites ONLY. Okta shares a unified console with ReportStream; those URLs should
//       not be added here.
variable "trusted_origin_urls" {
  description = "Trusted origin listing for the Okta Production environment. Data format is [Name, URL, [Scopes]]"
  default = [
    ["SimpleReport Test Env", "https://test.simplereport.gov/", ["CORS, REDIRECT"]],
    ["SimpleReport Staging Env", "https://stg.simplereport.gov", ["CORS, REDIRECT"]],
    ["SimpleReport Prod Env", "https://simplereport.gov", ["CORS, REDIRECT"]],
    ["SimpleReport Prod Env (www)", "https://www.simplereport.gov", ["CORS, REDIRECT"]]
  ]
}

variable "app_url" {
  type = string
}

variable "logout_redirect_uris" {
  default = ["https://simplereport.cdc.gov"]
}
