output "acr_simeplereport_name" {
  value = azurerm_container_registry.sr.name
}

output "acr_simeplereport_admin_name" {
  value = azurerm_container_registry.sr.admin_username
}

output "acr_simeplereport_admin_password" {
  value     = azurerm_container_registry.sr.admin_password
  sensitive = true
}

output "slack_alert_action_id" {
  value = module.alerting.monitor_group_id
}
