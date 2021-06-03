# external state
data "terraform_remote_state" "persistent_demo" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "demo/persistent-terraform.tfstate"
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

data "azurerm_resource_group" "rg_global" {
  name = "${local.project}-${local.name}-management"
}

data "azurerm_resource_group" "rg_prod" {
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
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_key_vault_secret" "sr_db_jdbc" {
  name         = "simple-report-${local.env}-db-jdbc"
  key_vault_id = data.azurerm_key_vault.global.id
}


data "azurerm_key_vault_secret" "datahub_api_key" {
  name         = "datahub-api-key-dev"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "slack_notify_webhook_url" {
  name         = "slack-notify-webhook-url-dev"
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

data "azurerm_key_vault_secret" "dynamics_client_id" {
  name         = "dynamics-client-id-dev"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "dynamics_client_secret" {
  name         = "dynamics-client-secret-dev"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "dynamics_tenant_id" {
  name         = "dynamics-tenant-id-dev"
  key_vault_id = data.azurerm_key_vault.global.id
}

data "azurerm_key_vault_secret" "dynamics_resource_url" {
  name         = "dynamics-resource-url-dev"
  key_vault_id = data.azurerm_key_vault.global.id
}

# logs
data "azurerm_log_analytics_workspace" "log_analytics" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_application_insights" "app_insights" {
  name                = "prime-simple-report-${local.env}-insights"
  resource_group_name = data.azurerm_resource_group.rg.name
}
