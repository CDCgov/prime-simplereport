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

variable "trusted_origin_urls" {
  description = "Trusted origin listing for the Okta Production environment. Data format is [Name, URL, [Scopes]]"
  default = [
    ["Localhost (DataHub)", "http://localhost:7071", ["CORS"]],
    ["DataHub (test)", "https://prime-data-hub-test.azurefd.net/", ["CORS"]],
    ["https://prime.cdc.gov", "https://prime.cdc.gov", ["CORS"]],
    ["Localhost", "http://localhost:8090", ["CORS"]],
    ["Staging", "https://prime-data-hub-staging.azurefd.net", ["CORS"]],
    ["Staging2", "https://staging.prime.cdc.gov", ["CORS"]],
    ["http://localhost:8080", "	http://localhost:8080", ["CORS, REDIRECT"]],
    ["Web Receiver - Staging", "https://pdhstagingpublic.z13.web.core.windows.net/", ["CORS"]],
    ["Web Receiver - Production", "https://pdhprodpublic.z13.web.core.windows.net/", ["CORS"]],
    ["ReportStream.gov", "https://reportstream.cdc.gov/", ["CORS"]],
    ["ReportStream - RHEFT", "https://prime-data-hub-rheft.azurefd.net", ["CORS, REDIRECT"]],
    ["Staging ReportStream", "	https://staging.reportstream.cdc.gov/", ["CORS"]],
    ["Localhost 3000", "http://localhost:3000", ["CORS, REDIRECT"]],
    ["SimpleReport Test Env", "https://test.simplereport.gov/", ["CORS, REDIRECT"]],
    ["SimpleReport Staging Env", "https://stg.simplereport.gov", ["CORS, REDIRECT"]],
    ["SimpleReport Prod Env", "https://simplereport.gov", ["CORS, REDIRECT"]],
    ["Localhost:8088", "http://localhost:8088", ["CORS"]],
    ["http://localhost:8091 (Mo Dev)", "http://localhost:8091", ["CORS, REDIRECT"]],
    ["SimpleReport Prod Env (www)", "https://www.simplereport.gov", ["CORS, REDIRECT"]],
    ["ReportStream TEST - PRIME", "https://test.prime.cdc.gov", ["CORS, REDIRECT"]],
    ["ReportStream TEST", "https://test.reportstream.cdc.gov", ["CORS, REDIRECT"]]
  ]
}

variable "app_url" {
  type = string
}

variable "logout_redirect_uris" {
  default = ["https://simplereport.cdc.gov"]
}
