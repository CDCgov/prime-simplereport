// Okta application
module "okta" {
  source = "../../services/okta-app"
  env = var.env
}

locals {
  management_tags = {
    prime-app = "simplereport"
    environment = "test"
  }
}

data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-${var.env}"
}

data "azurerm_key_vault" "kv" {
  name = "simple-report-global"
  resource_group_name = var.management_rg
}

data "azurerm_log_analytics_workspace" "law" {
  name = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.rg.name
}

// Create the virtual network and the persistent subnets
resource "azurerm_virtual_network" "vn" {
  name = "simple-report-test-network"
  resource_group_name = data.azurerm_resource_group.rg.name
  location = data.azurerm_resource_group.rg.location
  address_space = [
    "10.1.0.0/16"]

  tags = local.management_tags
}

module "db" {
  source = "../../services/database"
  env = "test"
  key_vault_id = data.azurerm_key_vault.kv.id
  log_workspace_id = data.azurerm_log_analytics_workspace.law.id
  rg_location = data.azurerm_resource_group.rg.location
  rg_name = data.azurerm_resource_group.rg.name
  tags = local.management_tags
}

// Create the Okta secrets

resource "azurerm_key_vault_secret" "okta_client_id" {
  key_vault_id = data.azurerm_key_vault.kv.id
  name = "okta-${var.env}-client-id"
  value = module.okta.client_id

  lifecycle {
    ignore_changes = [
      value]
  }
}

resource "azurerm_key_vault_secret" "okta_client_secret" {
  key_vault_id = data.azurerm_key_vault.kv.id
  name = "okta-${var.env}-client-secret"
  value = module.okta.client_secret

  lifecycle {
    ignore_changes = [
      value]
  }
}
