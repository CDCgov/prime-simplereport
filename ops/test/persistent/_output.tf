output "subnet_vm_id" {
  value = azurerm_subnet.vms.id
}

output "subnet_lbs_id" {
  value = azurerm_subnet.lbs.id
}

output "subnet_webapp_id" {
  value = azurerm_subnet.webapp.id
}

output "app_insight_id" {
  value = module.monitoring.app_insights_id
}

output "app_insights_instrumentation_key" {
  value = module.monitoring.app_insights_instrumentation_key
}

output "postgres_server_name" {
  value = module.db.server_name
}