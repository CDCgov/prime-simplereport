locals {
  management_tags = {
    prime-app         = "simple-report"
    prime-environment = "global"
  }
  storage_account_name = "usdssimplereportglobal"
}

// Storage container for terraform state
resource "azurerm_storage_container" "state_container" {
  name                 = "sr-tfstate"
  storage_account_name = local.storage_account_name

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

// App Insights for Azure Functions
module "insights" {
  source        = "../services/monitoring"
  env           = "global"
  management_rg = data.azurerm_resource_group.rg.name
  rg_location   = data.azurerm_resource_group.rg.location
  rg_name       = data.azurerm_resource_group.rg.name
  tags          = local.management_tags
}

// Alert routing configuration
module "alerting" {
  source           = "../services/alerting"
  rg_location      = data.azurerm_resource_group.rg.location
  rg_name          = data.azurerm_resource_group.rg.name
  function_app     = "definition.json"
  storage_account  = local.storage_account_name
  key_vault_id     = azurerm_key_vault.sr.id
  app_insights_key = module.insights.app_insights_instrumentation_key

  depends_on = [
    azurerm_key_vault_secret.slack_webhook
  ]
}
