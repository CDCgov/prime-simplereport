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

resource "okta_auth_server_claim" "prod_tenant_roles" {
  auth_server_id = data.okta_auth_server.default.id
  claim_type = "RESOURCE"
  name = "prod_roles"
  value_type = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value = "PROD-TENANT:"
  scopes = [
    okta_auth_server_scope.sr_prod.name]
}

resource "okta_auth_server_claim" "stg_tenant_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "staging_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "STG-TENANT:"
  scopes            = [
    okta_auth_server_scope.sr_stg.name]
}

resource "okta_auth_server_claim" "devtest_tenant_roles" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "devtest_roles"
  value_type        = "GROUPS"
  group_filter_type = "STARTS_WITH"
  value             = "TEST-TENANT:"
  scopes            = [
    okta_auth_server_scope.sr_devtest.name]
}

resource "okta_auth_server_claim" "is_simplereport_admin" {
  auth_server_id    = data.okta_auth_server.default.id
  claim_type        = "RESOURCE"
  name              = "is_simplereport_admin"
  value_type        = "EXPRESSION"
  value             = "isMemberOfGroupName(\"Prime SimpleReport Admins\")"
  scopes            = [
    okta_auth_server_scope.sr.name]
}

// Create the CDC/USDS user groups
resource "okta_group" "prime_users" {
  name        = "Prime Team Members"
  description = "All Prime team members"
}

resource "okta_group" "prime_simplereport_admins" {
  name        = "Prime SimpleReport Admins"
  description = "Application Administrators for SimpleReport"
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
