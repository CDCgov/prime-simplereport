data "azurerm_resource_group" "management" {
  name = "prime-simple-report-management"
}

data "azurerm_resource_group" "app" {
  name = var.rg_name
}

data "azurerm_log_analytics_workspace" "global" {
  name                = "simple-report-log-workspace-global"
  resource_group_name = data.azurerm_resource_group.management.name
}
