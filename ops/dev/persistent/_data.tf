data "azurerm_resource_group" "rg" {
  name = "${local.project}-${local.name}-${var.env}"
}

data "azurerm_resource_group" "rg_global" {
  name = "${local.project}-${local.name}-test"
}

data "azurerm_resource_group" "rg_prod" {
  name = "${local.project}-${local.name}-prod"
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