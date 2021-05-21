locals {
  is_prod = var.env == "prod"
  // This is commented out until we actually have production deployments. Right now, it's just set to test that simplereport.cdc.gov is running.
  //  app_url = local.is_prod ? "simplereport.cdc.gov" : "${var.env}.simplereport.cdc.gov"
}

data "azurerm_log_analytics_workspace" "law" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = var.management_rg
}

resource "azurerm_application_insights" "app_insights" {
  // App Insights doesn't have an option for frontend application types. So I picked NodeJS as it seemed the safest default.
  application_type    = "Node.JS"
  location            = var.rg_location
  resource_group_name = var.rg_name
  name                = "prime-simple-report-${var.env}-insights"

  tags = var.tags
}
