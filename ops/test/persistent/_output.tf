output "subnet_vm_id" {
  value = azurerm_subnet.vms.id
}

output "subnet_lbs_id" {
  value = azurerm_subnet.lbs.id
}

output "app_insight_id" {
  value = module.monitoring.app_insights_id
}