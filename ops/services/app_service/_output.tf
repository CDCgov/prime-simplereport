output "service_plan_id" {
  value = azurerm_service_plan.service_plan.id
}

output "app_service_id" {
  value = azurerm_linux_web_app.service.id
}

output "app_object_id" {
  value = azurerm_linux_web_app.service.identity[0].principal_id
}

output "app_hostname" {
  value = azurerm_linux_web_app.service.default_hostname
}

output "staging_hostname" {
  value = azurerm_linux_web_app_slot.staging.default_hostname
}

output "app_ip_addr" {
  value = azurerm_linux_web_app.service.outbound_ip_address_list
}