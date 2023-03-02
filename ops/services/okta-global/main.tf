// Create the required simple report scope

// We need to import and manage the pdi scope as well.
// So we can remove it later

resource "okta_auth_server_scope" "sr" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report"
  description      = "Default OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default          = false
}

// Add the required claims
resource "okta_auth_server_claim" "family_name" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type     = "RESOURCE"
  name           = "family_name"
  value          = "user.lastName"
}

resource "okta_auth_server_claim" "given_name" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type     = "RESOURCE"
  name           = "given_name"
  value          = "user.firstName"
}

// Create the CDC/USDS user groups
resource "okta_group" "prime_users" {
  name        = "Prime Team Members"
  description = "All Prime team members"
  skip_users  = true
}

// Create a sign on policy requiring MFA
resource "okta_policy_signon" "mfa_require" {
  name            = "MFA policy"
  status          = "ACTIVE"
  description     = "MFA for everyone"
  groups_included = [var.all_users_group_id]
}

# This unblocks global config sync issues but we need to revisit 
# and plan future global Okta work
# https://github.com/CDCgov/prime-simplereport/issues/5362
# resource "okta_policy_rule_signon" "app_mfa" {}
