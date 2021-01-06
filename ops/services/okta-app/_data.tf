data "okta_default_policy" "signon" {
  type = "OKTA_SIGN_ON"
}

// Link the CDC/USDS users to the application
data "okta_group" "cdc_users" {
  name = "Prime Team Members"
}

data "okta_auth_server" "default" {
  name = "default"
}