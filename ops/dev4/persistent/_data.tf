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
data "azurerm_resource_group" "dev4" {
  # Since we have multiple environments in this resource group, we need to hard-code the group suffix here.
  name = "${local.project}-${local.name}-dev"
}

data "azurerm_resource_group" "global" {
  name = "${local.project}-${local.name}-management"
}

data "azurerm_resource_group" "rg_prod" {
  name = "${local.project}-${local.name}-prod"
}

data "azurerm_client_config" "current" {}

# Network
data "azurerm_virtual_network" "dev4" {
  name                = "simple-report-${local.env}-network"
  resource_group_name = data.azurerm_resource_group.dev4.name
  depends_on = [
    module.vnet
  ]
}

# Secrets
data "azurerm_key_vault" "global" {
  name                = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.global.name
}

data "azurerm_key_vault" "db_keys" {
  name                = "simple-report-db-keys"
  resource_group_name = data.azurerm_resource_group.global.name
}

data "azurerm_key_vault_key" "db_encryption_key" {
  name         = local.env_level
  key_vault_id = data.azurerm_key_vault.db_keys.id
}
