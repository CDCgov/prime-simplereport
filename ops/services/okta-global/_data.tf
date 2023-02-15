data "okta_auth_server" "default" {
  name = "default"
}

data "okta_group" "everyone" {
  name = "Everyone"
}