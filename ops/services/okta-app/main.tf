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
  login_uri = var.app_url
  post_logout_redirect_uris = [
    var.logout_redirect_uris
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

resource "okta_app_user_schema" "org_schema" {
  app_id      = okta_app_oauth.app.id
  index       = "simple_report_org"
  title       = "Healthcare Organization"
  description = "Associated Healthcare Organization"
  type        = "string"
  master      = "PROFILE_MASTER"
}

resource "okta_app_user_schema" "user_schema" {
  app_id      = okta_app_oauth.app.id
  index       = "simple_report_user"
  title       = "User Type"
  description = "Whether or not the user is an administrator"
  type        = "string"
  master      = "PROFILE_MASTER"
}

resource "okta_app_group_assignment" "users" {
  count    = length(var.user_groups)
  app_id   = okta_app_oauth.app.id
  group_id = element(var.user_groups, count.index)
}

resource "okta_app_group_assignment" "prime_users" {
  app_id   = okta_app_oauth.app.id
  group_id = data.okta_group.cdc_users.id
  profile = jsonencode({
    simple_report_org  = null
    simple_report_user = null
  })
}
