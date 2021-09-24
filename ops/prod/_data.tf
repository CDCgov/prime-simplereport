# external state
data "terraform_remote_state" "persistent_prod" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "prod/persistent-terraform.tfstate"
  }
}

data "terraform_remote_state" "global" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "global/terraform.tfstate"
  }
}

# Resource Groups
data "azurerm_resource_group" "rg" {
  name = "${local.project}-${local.name}-${local.env}"
}

data "azurerm_resource_group" "global" {
  name = "${local.project}-${local.name}-management"
}

data "azurerm_resource_group" "prod" {
  name = "${local.project}-${local.name}-prod"
}

data "azurerm_client_config" "current" {}

# Network
data "azurerm_virtual_network" "vn" {
  name                = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Secrets
data "azurerm_key_vault" "global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.global.name
}

data "azurerm_key_vault_secret" "sr_db_jdbc" {
  name         = "simple-report-${local.env}-db-jdbc"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "metabase_db_uri" {
  name         = "simple-report-${local.env}-db-metabase-uri"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "postgres_user" {
  name         = "simple-report-${local.env}-db-username"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "postgres_password" {
  name         = "simple-report-${local.env}-db-password"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "postgres_nophi_user" {
  name         = "simple-report-${local.env}-db-username-no-phi"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "postgres_nophi_password" {
  name         = "simple-report-${local.env}-db-password-no-phi"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "slack_notify_webhook_url" {
  name         = "slack-notify-webhook-url-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "okta_api_key" {
  name         = "okta-api-key"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-id"
}

data "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-${local.env}-client-secret"
}

data "azurerm_key_vault_secret" "org_facility_name" {
  name         = "org-facility-name"
  key_vault_id = data.azurerm_key_vault.global.id
}
data "azurerm_key_vault_secret" "org_external_id" {
  name         = "org-external-id"
  key_vault_id = data.azurerm_key_vault.global.id
}
data "azurerm_key_vault_secret" "org_clia_number" {
  name         = "org-clia-number"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "twilio_account_sid" {
  name         = "twilio-account-sid"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "twilio_auth_token" {
  name         = "twilio-auth-token"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "sendgrid_api_key" {
  name         = "sendgrid-api-key"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "smarty_auth_id" {
  name         = "smarty-auth-id"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "smarty_auth_token" {
  name         = "smarty-auth-token"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_token_endpoint" {
  name         = "experian-token-endpoint-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_initial_request_endpoint" {
  name         = "experian-initial-request-endpoint-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_domain" {
  name         = "experian-domain-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_client_id" {
  name         = "experian-client-id-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_client_secret" {
  name         = "experian-client-secret-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_subscriber_subcode" {
  name         = "experian-crosscore-subscriber-subcode-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_username" {
  name         = "experian-crosscore-username-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_crosscore_password" {
  name         = "experian-crosscore-password-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_tenant_id" {
  name         = "experian-preciseid-tenant-id-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_client_reference_id" {
  name         = "experian-preciseid-client-reference-id-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_username" {
  name         = "experian-preciseid-username-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "experian_preciseid_password" {
  name         = "experian-preciseid-password-prod"
  key_vault_id = data.azurerm_key_vault.global.id
}

# logs
data "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.global.name
}

data "azurerm_application_insights" "app_insights" {
  name                = "prime-simple-report-${local.env}-insights"
  resource_group_name = data.azurerm_resource_group.rg.name
}

data "azurerm_storage_account" "app" {
  name                = "simplereport${local.env}app"
  resource_group_name = data.azurerm_resource_group.rg.name
}