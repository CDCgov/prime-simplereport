resource "okta_app_oauth" "app" {
  label = "simple-report-${var.env}"
  type                       = "web"
  grant_types                = ["authorization_code"]
  redirect_uris              = [
    "http://localhost:8080",
    "http://localhost:9090",
    "https://${var.env}.simplereport.org/app"]
  response_types             = ["code"]

  lifecycle {
    ignore_changes = [
    groups
    ]
  }
}

resource "okta_app_group_assignment" "users" {
  count = length(var.user_groups)
  app_id = okta_app_oauth.app.id
  group_id = element(var.user_groups, count.index)
}
