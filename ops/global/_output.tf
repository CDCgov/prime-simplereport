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

output "pagerduty_non_prod_action_id" {
  value = module.pagerduty_non_prod.monitor_group_id
}

output "pagerduty_prod_action_id" {
  value = module.pagerduty_prod.monitor_group_id
}
