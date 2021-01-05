locals {
  dev_urls = [
    "http://localhost:8080",
    "http://localhost:9090",
    "http://localhost:3000",
    "https://simple-report-qa.app.cloud.gov/",
    "https://simple-report-qa-api.app.cloud.gov/",
    "https://staging.simplereport.org/app"
  ]
  is_prod = var.env == "prod"
  app_url = local.is_prod ? "https://simplereport.cdc.gov/app" : "https://${var.env}.simplereport.org/app"
}


resource "okta_app_oauth" "app" {
  label = local.is_prod ? "Simple Report" : "Simple Report (${var.env})"
  type  = "web"
  grant_types = [
    "authorization_code",
  "implicit"]
  redirect_uris = concat(local.dev_urls, [
    "https://${var.env}.simplereport.org/app",
  "https://simplereport.cdc.gov/app"])
  response_types = [
    "code",
    "id_token",
  "token"]
  login_uri = local.app_url
  post_logout_redirect_uris = [
    "https://simplereport.cdc.gov"
  ]
  hide_ios = false
  hide_web = false

  lifecycle {
    ignore_changes = [
      groups
    ]
  }
}

// Create the custom app mappings

resource "okta_app_group_assignment" "users" {
  count    = length(var.user_groups)
  app_id   = okta_app_oauth.app.id
  group_id = element(var.user_groups, count.index)
}

// Link the CDC/USDS users to the application
data "okta_group" "cdc_users" {
  name = "Prime Team Members"
}

resource "okta_app_group_assignment" "prime_users" {
  app_id   = okta_app_oauth.app.id
  group_id = data.okta_group.cdc_users.id
  profile = jsonencode({
    simple_report_org  = null
    simple_report_user = null
  })
}

resource "okta_group" "simplereport_prod_admins" {
  name        = "SR-PROD-ADMINS"
  description = "PRODUCTION Application Administrators for SimpleReport"
}

resource "okta_group" "simplereport_stg_admins" {
  name        = "SR-STG-ADMINS"
  description = "STAGING Application Administrators for SimpleReport"
}

resource "okta_group" "simplereport_dev_admins" {
  name        = "SR-DEV-ADMINS"
  description = "DEV/TEST Application Administrators for SimpleReport"
}

resource "okta_auth_server_claim" "simplereport_prod_roles" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "prod_roles"
  value_type = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value = "SR-PROD-"
  scopes = [
    okta_auth_server_scope.sr_prod.name]
}

resource "okta_auth_server_claim" "simplereport_stg_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "stg_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "SR-STG-"
  scopes            = [
    okta_auth_server_scope.sr_stg.name]
}

resource "okta_auth_server_claim" "simplereport_dev_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "dev_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "SR-DEV-"
  scopes            = [
    okta_auth_server_scope.sr_dev.name]
}
