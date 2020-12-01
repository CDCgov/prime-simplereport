provider "azurerm" {
  version = "~>2.0"
  features {}
  skip_provider_registration = true
}

provider "okta" {
  org_name = "hhs-prime"
  base_url = "okta.com"
}

locals {
  management_tags = {
    prime-app = "simplereport"
    prime-environment = "all"
  }
}

data "azurerm_resource_group" "rg" {
  name = var.resource_group
}

// Storage container for terraform state

resource "azurerm_storage_container" "state_container" {
  name = "sr-tfstate"
  storage_account_name = "usdssimplereportglobal"

  lifecycle {
    prevent_destroy = true
  }
}


// Log analytics
resource "azurerm_log_analytics_workspace" "sr" {
  name = "simple-report-log-workspace-global"
  location = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku = "PerGB2018"
  retention_in_days = 30

  tags = local.management_tags
}

// ACR

resource "azurerm_container_registry" "sr" {
  location = data.azurerm_resource_group.rg.location
  name = "simplereportacr"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku = "Standard"

  tags = local.management_tags
}

// Key vault

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "sr" {
  location = data.azurerm_resource_group.rg.location
  name = "simple-report-global"
  resource_group_name = data.azurerm_resource_group.rg.name
  sku_name = "standard"
  tenant_id = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled = true

//  network_acls {
//    bypass = "AzureServices"
//    default_action = "Deny"
//  }

  tags = local.management_tags
}

resource "azurerm_key_vault_access_policy" "self" {
  key_vault_id = azurerm_key_vault.sr.id
  object_id = data.azurerm_client_config.current.object_id
  tenant_id = data.azurerm_client_config.current.tenant_id

  key_permissions = [
    "get",
    "list",
    "create",
    "delete",
    "recover",
  ]

  secret_permissions = [
    "get",
    "list",
    "set",
    "delete",
    "recover",
  ]

  certificate_permissions = [
    "get",
    "list",
    "import",
    "create",
    "delete",
    "recover",
  ]

  storage_permissions = [
    "get",
    "list",
    "set",
    "delete",
    "recover",
  ]
}

// Okta configuration

module "okta" {
  source = "../services/okta-global"
}
