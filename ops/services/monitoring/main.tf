locals {
  is_prod = var.env == "prod"
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
  disable_ip_masking  = false

  daily_data_cap_in_gb = var.ai_ingest_cap_gb
  retention_in_days    = var.ai_retention_days

  tags = var.tags
}
