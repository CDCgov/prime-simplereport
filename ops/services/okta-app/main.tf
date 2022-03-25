locals {
  is_prod = var.env == "prod"
}

resource "okta_app_oauth" "app" {
  label = local.is_prod ? "Simple Report" : "Simple Report (${var.env})"
  type  = "web"
  grant_types = [
    "authorization_code",
    "implicit"
  ]
  redirect_uris = concat(var.redirect_urls, [
    "https://${var.env}.simplereport.org/app",
    "https://${var.env}.simplereport.gov/app",
  ])
  response_types = [
    "code",
    "id_token",
    "token"
  ]
  login_uri                 = var.app_url
  post_logout_redirect_uris = var.logout_redirect_uris
  hide_ios                  = false
  hide_web                  = false
  login_mode                = "SPEC"

  skip_users  = true
  skip_groups = true

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

resource "okta_app_group_assignment" "prime_users" {
  app_id   = okta_app_oauth.app.id
  group_id = data.okta_group.cdc_users.id
}

resource "okta_group" "simplereport_admins" {
  name        = "SR-${upper(var.env)}-ADMINS"
  description = "${upper(var.env)} Application Administrators for SimpleReport"
}

resource "okta_auth_server_claim" "simplereport_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "${var.env}_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "SR-${upper(var.env)}-"
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

resource "okta_trusted_origin" "sr_trusted_origin" {
  for_each = { for origin in var.trusted_origins : origin.name => origin }
  name     = each.value.name
  origin   = each.value.url
  scopes   = each.value.scopes
}