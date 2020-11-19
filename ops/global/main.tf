provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

locals {
  management_tags = {
    prime-app = "simplereport"
    stack = "management"
  }
}

data "azurerm_resource_group" "rg" {
  name = var.resource_group
}

// Storage container for terraform state

resource "azurerm_storage_container" "state_container" {
  name = "sr-tfstate"
  storage_account_name = "srterraform"

  lifecycle {
    prevent_destroy = true
  }
}


// Log analytics

resource "azurerm_log_analytics_workspace" "pdi-log" {
  name = "pdi-log-workspace"
  location = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku = "PerGB2018"
  retention_in_days = 30

  tags = local.management_tags
}

// ACR

resource "azurerm_container_registry" "pdi" {
  location = data.azurerm_resource_group.rg.location
  name = "simplereportacr"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku = "Standard"

  tags = local.management_tags
}
