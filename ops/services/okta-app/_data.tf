data "okta_default_policy" "signon" {
  type = "OKTA_SIGN_ON"
}

data "okta_auth_server" "default" {
  name = "default"
}
