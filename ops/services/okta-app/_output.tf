output "client_id" {
  value = okta_app_oauth.app.client_id
}

output "client_secret" {
  value     = okta_app_oauth.app.client_secret
  sensitive = true
}
