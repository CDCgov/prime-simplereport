locals {
  management_tags = {
    prime-app         = "simple-report"
    prime-environment = "global"
  }
}

// Storage container for terraform state
resource "azurerm_storage_container" "state_container" {
  name                 = "sr-tfstate"
  storage_account_name = "usdssimplereportglobal"

  lifecycle {
    prevent_destroy = true
  }
}

// Log analytics
resource "azurerm_log_analytics_workspace" "sr" {
  name                = "simple-report-log-workspace-global"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.management_tags
}


// Okta configuration
module "okta" {
  source = "../services/okta-global"
}
