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

resource "okta_group" "simplereport_admins" {
  name        = "SR-${upper(var.env)}-ADMINS"
  description = "${upper(var.env)} Application Administrators for SimpleReport"
}

resource "okta_auth_server_claim" "simplereport_roles" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "${var.env}_roles"
  value_type = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value = "SR-${upper(var.env)}-"
  scopes = [
    okta_auth_server_scope.sr_env.name]
}

resource "okta_auth_server_scope" "sr_env" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report_${var.env}"
  description      = "${upper(var.env)}-only OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default          = false
}
