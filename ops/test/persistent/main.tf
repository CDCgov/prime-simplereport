provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}
locals {
  management_tags = {
    prime-app = "simplereport"
    environment = "test"
  }
}

data "azurerm_resource_group" "rg" {
  name = "prime-simple-report-test"
}

data "azurerm_key_vault" "kv" {
  name = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg.name
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

resource "azurerm_subnet" "db" {
  name = "db-subnet"
  resource_group_name = data.azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vn.name
  address_prefixes = [
    "10.1.252.0/24"]
  service_endpoints = ["Microsoft.Sql"]
}


module "db" {
  source = "../../services/database"
  env = "test"
  key_vault_id = data.azurerm_key_vault.kv.id
  log_workspace_id = data.azurerm_log_analytics_workspace.law.id
  rg_location = data.azurerm_resource_group.rg.location
  rg_name = data.azurerm_resource_group.rg.name
  tags = local.management_tags
  inbound_subnets = {
    "db": azurerm_subnet.db.id
  }
}
