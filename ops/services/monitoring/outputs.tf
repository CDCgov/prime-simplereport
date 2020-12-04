output "app_insights_id" {
  value = azurerm_application_insights.app_insights.app_id
}

output "log_analytics_workspace_id" {
  value = data.azurerm_log_analytics_workspace.law.id
}
