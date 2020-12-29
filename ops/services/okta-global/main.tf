// Create the required simple report scope

data "okta_auth_server" "default" {
  name = "default"
}

// We need to import and manage the pdi scope as well.
// So we can remove it later

resource "okta_auth_server_scope" "sr" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report"
  description      = "Default OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default          = false
}

resource "okta_auth_server_scope" "sr_prod" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report_prod"
  description      = "Production-only OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default          = false
}

resource "okta_auth_server_scope" "sr_stg" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report_staging"
  description      = "Staging-only OAUTH scope for Simple Report application"
  metadata_publish = "NO_CLIENTS"
  default          = false
}

resource "okta_auth_server_scope" "sr_devtest" {
  auth_server_id   = data.okta_auth_server.default.id
  name             = "simple_report_devtest"
  description      = "Dev/test-only OAUTH scope for Simple Report application"
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
  name              = "staging_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "SR-STG-"
  scopes            = [
    okta_auth_server_scope.sr_stg.name]
}

resource "okta_auth_server_claim" "simplereport_devtest_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "devtest_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "SR-TEST-"
  scopes            = [
    okta_auth_server_scope.sr_devtest.name]
}

// Create the CDC/USDS user groups
resource "okta_group" "prime_users" {
  name        = "Prime Team Members"
  description = "All Prime team members"
}

resource "okta_group" "simplereport_prod_admins" {
  name        = "SR-PROD-ADMINS"
  description = "PRODUCTION Application Administrators for SimpleReport"
}

resource "okta_group" "simplereport_stg_admins" {
  name        = "SR-STG-ADMINS"
  description = "STAGING Application Administrators for SimpleReport"
}

resource "okta_group" "simplereport_devtest_admins" {
  name        = "SR-TEST-ADMINS"
  description = "DEV/TEST Application Administrators for SimpleReport"
}

// Create a sign on policy requiring MFA

resource "okta_policy_signon" "mfa_require" {
  name            = "simple-report-mfa-require"
  status          = "ACTIVE"
  description     = "Require MFA for all users"
  groups_included = []
}

resource "okta_policy_rule_signon" "app_mfa" {
  policyid           = okta_policy_signon.mfa_require.id
  name               = "simple-report-mfa-require"
  status             = "ACTIVE"
  mfa_required       = true
  mfa_prompt         = "SESSION"
  network_connection = "ANYWHERE"
  authtype           = "ANY"
  mfa_lifetime       = 720
  session_idle       = 720
  session_lifetime   = 720
}
