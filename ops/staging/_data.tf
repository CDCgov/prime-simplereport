# external state
data "terraform_remote_state" "persistent_stg" {
  backend = "azurerm"
  config = {
    resource_group_name  = "prime-simple-report-test"
    storage_account_name = "usdssimplereportglobal"
    container_name       = "sr-tfstate"
    key                  = "test/persistent-terraform.tfstate"
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


# Stg will reuse prod okta secrets
data "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-prod-client-id"
}

data "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.global.id
  name         = "okta-prod-client-secret"
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
