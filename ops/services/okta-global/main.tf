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

//Changes made here also need to be made to the Azure WAF!
resource "okta_network_zone" "sr_network_zone" {
  name  = "Geographic Restrictions"
  type  = "DYNAMIC"
  usage = "BLOCKLIST"
  dynamic_locations = [
    "AF", //Afghanistan (ITAR)
    "AL", //Albania (OFAC)
    "BA", //Bosnia and Herzegovinia (OFAC)
    "BG", //Bulgaria (OFAC)
    "BY", //Belarus (ITAR, OFAC)
    "CD", //Democratic Republic of the Congo (ITAR)
    "CF", //Central African Republic (ITAR, OFAC)
    "CG", //Congo (ITAR, OFAC)
    "CI", //Côte d'Ivoire (ITAR)
    "CN", //People's Republic of China (EAR, ITAR)
    "CU", //Cuba (EAR, ITAR, OFAC)
    "CY", //Cyprus (ITAR)
    "ER", //Eritrea (ITAR)
    "ET", //Ethiopia (ITAR-adjacent, due to ongoing conflict with Eritrea)
    "GE", //Georgia (preemptive, due to presence of separatist regions sympathetic to Russian Federation)
    "HK", //Hong Kong SAR (due to oversight by People's Republic of China)
    "HR", //Croatia (OFAC)
    "HT", //Haiti (ITAR)
    "IQ", //Iraq (EAR, ITAR, OFAC)
    "IR", //Iran, Islamic Republic of (EAR, ITAR, OFAC)
    "KP", //Korea, Democratic People's Republic of (EAR, ITAR, OFAC)
    "LB", //Lebanon (ITAR, OFAC)
    "LK", //Sri Lanka (ITAR)
    "LR", //Liberia (ITAR, OFAC)
    "LY", //Libya (ITAR, OFAC)
    "MD", //Moldova, Republic of (preemptive, due to presence of separatist regions sympathetic to Russian Federation)
    "ME", //Montenegro (OFAC)
    "MK", //North Macedonia (OFAC)
    "MM", //Myanmar (ITAR)
    "MO", //Macao SAR (due to oversight by People's Republic of China)
    "NI", //Nicaragua (preemptive, due to association with sanctioned entities)
    "RS", //Serbia (OFAC)
    "RU", //Russian Federation (EAR, OFAC)
    "SO", //Somalia (ITAR, OFAC)
    "SY", //Syrian Arab Republic (EAR, ITAR, OFAC)
    "UA", //Ukraine (OFAC, due to occupation by the Russian Federation)
    "VE", //Venezuela (EAR, ITAR, OFAC)
    "VN", //Vietnam (ITAR)
    "XK", //Kosovo (OFAC)
    "YE", //Yemen (OFAC)
    "ZW"  //Zimbabwe (ITAR)
  ]
}
