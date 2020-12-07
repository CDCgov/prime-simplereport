data "azurerm_resource_group" "rg" {
  name = "${var.application_name}-${var.env}"
}

data "azurerm_resource_group" "rg_global" {
  name = "${var.application_name}-test"
}

data "azurerm_client_config" "current" {}

# Network
data "azurerm_virtual_network" "dev" {
  name                = "simple-report-${var.env}-network"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Secrets
data "azurerm_key_vault" "sr_global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg_global.name
}

data "azurerm_key_vault_secret" "sr_dev_db_jdbc" {
  name         = "simple-report-dev-db-jdbc"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "psql_connect_password_dev" {
  name         = "psql-connect-password-dev"
  key_vault_id = data.azurerm_key_vault.sr_global.id
}

data "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  name         = "okta-${var.env}-client-id"
}

data "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.sr_global.id
  name         = "okta-${var.env}-client-secret"
}