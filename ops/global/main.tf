locals {
  project = "prime"
  name    = "simple-report"
  env     = "global"
  management_tags = {
    prime-app      = local.name
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
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

// Okta preview configuration
# module "okta_preview" {
#   source = "../services/okta-global"

#   all_users_group_id = data.okta_group.everyone.id
# }

// Okta configuration
module "okta" {
  source = "../services/okta-global"

  all_users_group_id = data.okta_group.everyone.id
}

// App Insights for Azure Functions
module "insights" {
  source           = "../services/monitoring"
  env              = "global"
  ai_ingest_cap_gb = 100
  management_rg    = data.azurerm_resource_group.rg.name
  rg_location      = data.azurerm_resource_group.rg.location
  rg_name          = data.azurerm_resource_group.rg.name
  tags             = local.management_tags
}

module "pagerduty_non_prod" {
  source                  = "../services/pagerduty"
  resource_group_name     = data.azurerm_resource_group.rg.name
  pagerduty_service_name  = "SimpleReport - Non-Prod"
  action_group_short_name = "SR-NonProd"
}

module "pagerduty_prod" {
  source                  = "../services/pagerduty"
  resource_group_name     = data.azurerm_resource_group.rg.name
  pagerduty_service_name  = "SimpleReport - Production"
  action_group_short_name = "SR-Prod"
}

module "pagerduty_stg" {
  source                  = "../services/pagerduty"
  resource_group_name     = data.azurerm_resource_group.rg.name
  pagerduty_service_name  = "SimpleReport - Stg"
  action_group_short_name = "SR-Stg"
}